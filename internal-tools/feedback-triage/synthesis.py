import json
import os
from typing import Literal

from openai import AsyncOpenAI
from agents import (
    Agent,
    Runner,
    OpenAIChatCompletionsModel,
    set_tracing_disabled,
)
from pydantic import BaseModel, Field, ValidationError


# ---------------------------------------------------------
# CONFIG
# ---------------------------------------------------------

INPUT_FILE = "triage_candidates.json"
OUTPUT_FILE = "round1_synthesis.json"

set_tracing_disabled(True)


# ---------------------------------------------------------
# MODEL
# ---------------------------------------------------------

openrouter_client = AsyncOpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1",
)

model = OpenAIChatCompletionsModel(
    model="openrouter/free",
    openai_client=openrouter_client,
)


# ---------------------------------------------------------
# DATA MODELS
# ---------------------------------------------------------

class Theme(BaseModel):
    theme_name: str

    theme_type: Literal[
        "Pain Point",
        "Positive Signal",
        "Product Direction",
        "Feature Opportunity",
        "Behavioral Question",
        "Other",
    ]

    observation_ids: list[str]

    interpretation: str

    disposition: Literal[
        "Private Beta Candidate",
        "Investigate Further",
        "Later",
        "Do Not Act Yet",
    ]


class SynthesisResult(BaseModel):
    themes: list[Theme] = Field(min_length=1)


# ---------------------------------------------------------
# AGENT
# ---------------------------------------------------------

agent = Agent(
    name="DawgDecision Feedback Synthesis Agent",

    instructions=(
        "You synthesize structured feedback from DawgDecision's first round "
        "of student testing. "

        "You are NOT doing individual feedback triage. "
        "The observations have already been extracted. "

        "Your job is to identify meaningful cross-user themes. "

        "Group observations together only when they reflect the same or closely "
        "related underlying problem, value, strategic direction, or opportunity. "

        "Do not group unrelated ideas merely because they concern the same "
        "general product area. "

        "Prefer a small number of meaningful themes over many tiny themes. "

        "Preserve disagreement and one-off feedback. "
        "Do not pretend a theme is recurring when only one tester supports it. "

        "Do not count observations. "
        "Do not estimate how many testers support a theme. "
        "Python will calculate independent tester counts later. "

        "Use observation_ids to identify exactly which observations support each theme. "

        "Every observation ID you reference must exist in the supplied data. "

        "An observation may support more than one theme only when that is genuinely "
        "necessary. Avoid unnecessary overlap. "

        "Theme types: "
        "Pain Point = recurring or meaningful friction/problem. "
        "Positive Signal = existing product behavior users explicitly value. "
        "Product Direction = feedback about strategic focus or expansion. "
        "Feature Opportunity = a capability users want that may address a need. "
        "Behavioral Question = an unresolved question that should be tested with "
        "behavioral research rather than immediately built. "
        "Other = meaningful evidence that does not fit the above. "

        "Disposition guidance: "
        "Private Beta Candidate = evidence is strong or concrete enough to consider "
        "for the upcoming private-beta iteration. "
        "Investigate Further = evidence suggests an important underlying issue, "
        "but more problem-space or behavioral research is needed before building. "
        "Later = legitimate idea, but not appropriate for the current housing-focused phase. "
        "Do Not Act Yet = too weak, vague, isolated, or speculative to justify action. "

        "Do not treat requested features as automatically correct solutions. "
        "When several requested features appear to point toward one broader user need, "
        "the theme should describe that broader need. "

        "Stay grounded in the supplied observations. "
        "Do not invent market demand, business value, institutional value, "
        "user psychology, or product strategy beyond what the evidence supports. "

        "Return ONLY valid JSON with exactly one top-level field called themes. "

        "Each theme must contain exactly: "
        "theme_name, theme_type, observation_ids, interpretation, disposition. "

        "Do not use markdown or explanatory text outside the JSON."
    ),

    model=model,
)


# ---------------------------------------------------------
# CLEAN MODEL OUTPUT
# ---------------------------------------------------------

def clean_model_output(output: str) -> str:
    cleaned = output.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[len("```json"):].strip()

    elif cleaned.startswith("```"):
        cleaned = cleaned[len("```"):].strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    return cleaned


# ---------------------------------------------------------
# LOAD OBSERVATIONS
# ---------------------------------------------------------

if not os.path.exists(INPUT_FILE):
    raise FileNotFoundError(
        f"{INPUT_FILE} was not found."
    )


with open(
        INPUT_FILE,
        "r",
        encoding="utf-8",
) as file:
    raw_observations = json.load(file)


# ---------------------------------------------------------
# ASSIGN STABLE OBSERVATION IDS
# ---------------------------------------------------------

observations = []

for index, item in enumerate(
        raw_observations,
        start=1,
):
    observation = dict(item)

    observation["observation_id"] = (
        f"OBS-{index:03d}"
    )

    observations.append(observation)


observation_lookup = {
    item["observation_id"]: item
    for item in observations
}


# ---------------------------------------------------------
# BUILD MODEL INPUT
# ---------------------------------------------------------

prompt = (
        "Synthesize the following DawgDecision Round 1 feedback observations.\n\n"
        + json.dumps(
    observations,
    indent=2,
    ensure_ascii=False,
)
)


# ---------------------------------------------------------
# RUN SYNTHESIS
# ---------------------------------------------------------

max_attempts = 3
last_error = None

for attempt in range(max_attempts):

    result = Runner.run_sync(
        agent,
        prompt,
    )

    cleaned = clean_model_output(
        result.final_output
    )

    try:
        data = json.loads(cleaned)

        synthesis = (
            SynthesisResult.model_validate(
                data
            )
        )

        break

    except (
            json.JSONDecodeError,
            ValidationError,
    ) as error:

        last_error = error

        print(
            f"Attempt {attempt + 1}/{max_attempts} "
            "returned invalid output."
        )

else:
    raise RuntimeError(
        f"Synthesis failed: {last_error}"
    )


# ---------------------------------------------------------
# VALIDATE + ENRICH THEMES
# ---------------------------------------------------------

final_themes = []

for index, theme in enumerate(
        synthesis.themes,
        start=1,
):

    valid_observation_ids = [
        obs_id
        for obs_id in theme.observation_ids
        if obs_id in observation_lookup
    ]

    supporting_observations = [
        observation_lookup[obs_id]
        for obs_id in valid_observation_ids
    ]

    # Count UNIQUE testers, not observations.
    source_feedback_ids = sorted(
        {
            obs["source_feedback_id"]
            for obs in supporting_observations
        }
    )

    supporting_evidence = [
        {
            "observation_id": obs["observation_id"],
            "source_feedback_id": obs["source_feedback_id"],
            "evidence": obs["evidence"],
            "summary": obs["summary"],
        }
        for obs in supporting_observations
    ]

    final_themes.append(
        {
            "theme_id": f"THEME-{index:02d}",
            "theme_name": theme.theme_name,
            "theme_type": theme.theme_type,

            "independent_tester_count":
                len(source_feedback_ids),

            "source_feedback_ids":
                source_feedback_ids,

            "observation_ids":
                valid_observation_ids,

            "interpretation":
                theme.interpretation,

            "disposition":
                theme.disposition,

            "supporting_evidence":
                supporting_evidence,
        }
    )


# ---------------------------------------------------------
# SORT BY INDEPENDENT TESTER COUNT
# ---------------------------------------------------------

final_themes.sort(
    key=lambda theme:
    theme["independent_tester_count"],
    reverse=True,
)


# ---------------------------------------------------------
# SAVE
# ---------------------------------------------------------

with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8",
) as file:

    json.dump(
        final_themes,
        file,
        indent=2,
        ensure_ascii=False,
    )


# ---------------------------------------------------------
# PRINT SUMMARY
# ---------------------------------------------------------

print()
print("=" * 72)
print("DAWGDECISION ROUND 1 — SYNTHESIS")
print("=" * 72)
print()

for theme in final_themes:

    print(
        f"{theme['theme_id']} | "
        f"{theme['theme_name']}"
    )

    print(
        f"  Type: "
        f"{theme['theme_type']}"
    )

    print(
        f"  Independent testers: "
        f"{theme['independent_tester_count']}"
    )

    print(
        f"  Sources: "
        f"{', '.join(theme['source_feedback_ids'])}"
    )

    print(
        f"  Disposition: "
        f"{theme['disposition']}"
    )

    print(
        f"  Interpretation: "
        f"{theme['interpretation']}"
    )

    print()


print(
    f"Full synthesis saved to "
    f"{OUTPUT_FILE}"
)