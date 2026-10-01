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

INPUT_FILE = "round1_feedback.json"
OUTPUT_FILE = "triage_candidates.json"
ERROR_FILE = "triage_errors.json"

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

class TriageObservation(BaseModel):
    source_feedback_id: str

    category: Literal[
        "Bug",
        "Usability",
        "Feature Request",
        "Data Gap",
        "Content Clarity",
        "Positive Signal",
        "Product Direction",
        "Other",
    ]

    product_area: Literal[
        "Landing Page",
        "Authentication",
        "Navigation",
        "Dashboard",
        "Housing Compare",
        "Housing Sources",
        "Comparison Results",
        "Financial Plan",
        "Saved Financial Plans",
        "General",
    ]

    evidence: str
    underlying_need: str
    summary: str


class TriageBatch(BaseModel):
    items: list[TriageObservation] = Field(min_length=1)


# ---------------------------------------------------------
# AGENT
# ---------------------------------------------------------

agent = Agent(
    name="DawgDecision Feedback Triage",

    instructions=(
        "You analyze feedback from students testing DawgDecision, "
        "a student decision-support product currently focused on housing. "

        "Your only job is to turn raw tester feedback into a small number "
        "of grounded product observations. "

        "Prefer fewer, stronger observations over excessive fragmentation. "
        "A typical feedback set should produce 1-4 observations. "
        "Use more only when the tester clearly raises several independent issues. "

        "Keep related statements together when they describe the same underlying issue. "

        "Split statements only when they concern meaningfully different problems, "
        "needs, product areas, positive signals, or product-direction opinions. "

        "Stay close to what the tester actually said. "
        "Do not invent strategy, motivations, business implications, "
        "technical causes, or requirements. "

        "If feedback is vague, keep the interpretation vague. "
        "Do not turn vague feedback into a specific product requirement. "

        "Do not preserve generic praise such as 'great idea' unless the tester "
        "identifies something specific about the product that they value. "

        "Use Positive Signal when the tester clearly identifies a specific "
        "existing capability, experience, or design element as valuable or useful. "

        "Use Product Direction for high-level opinions such as focusing on housing "
        "before expanding into other decisions. "

        "If the tester proposes a feature, identify the narrowest reasonable "
        "underlying need supported by their words. "
        "Do not assume their proposed feature is automatically the correct solution. "

        "Use exactly one category per observation: "
        "Bug, Usability, Feature Request, Data Gap, Content Clarity, "
        "Positive Signal, Product Direction, Other. "

        "Category guidance: "
        "Bug means something appears to malfunction or render incorrectly. "
        "Usability means the product works but is confusing, inconvenient, or difficult to use. "
        "Data Gap means needed housing or decision data is absent or incomplete. "
        "Content Clarity means information exists but is unclear or poorly presented. "
        "Feature Request means the tester is asking for a new capability. "

        "Use exactly one product area per observation: "
        "Landing Page, Authentication, Navigation, Dashboard, Housing Compare, "
        "Housing Sources, Comparison Results, Financial Plan, "
        "Saved Financial Plans, General. "

        "Evidence must be a short verbatim excerpt from the tester. "

        "Underlying_need must be the narrowest defensible user need or value "
        "supported by that evidence. "

        "Summary must be short, factual, and neutral. "

        "Return ONLY valid JSON in this format: "
        '{"items": [...]} '

        "Every item must contain exactly these fields: "
        "source_feedback_id, category, product_area, evidence, "
        "underlying_need, summary. "

        "Do not use markdown. "
        "Do not use code fences. "
        "Do not include commentary outside the JSON."
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
# TRIAGE ONE TESTER
# ---------------------------------------------------------

def triage_feedback(
        source_feedback_id: str,
        feedback: str,
        max_attempts: int = 3,
) -> TriageBatch:

    base_prompt = (
        f"source_feedback_id: {source_feedback_id}\n\n"
        f"Tester feedback:\n{feedback}"
    )

    last_error = None

    for attempt in range(max_attempts):

        if attempt == 0:
            prompt = base_prompt
        else:
            prompt = (
                "Your previous response was invalid. "
                "Return ONLY valid JSON matching the required schema. "
                "Keep the observations few, literal, and grounded. "
                "Do not return an empty items array.\n\n"
                f"{base_prompt}"
            )

        result = Runner.run_sync(
            agent,
            prompt,
        )

        cleaned_output = clean_model_output(
            result.final_output
        )

        try:
            data = json.loads(cleaned_output)

            batch = TriageBatch.model_validate(data)

            # Guarantee the correct tester ID.
            for item in batch.items:
                item.source_feedback_id = source_feedback_id

            return batch

        except (
                json.JSONDecodeError,
                ValidationError,
        ) as error:

            last_error = error

            print(
                f"  Attempt {attempt + 1}/{max_attempts} "
                "returned invalid output."
            )

    raise RuntimeError(
        f"Triage failed for {source_feedback_id}: {last_error}"
    )


# ---------------------------------------------------------
# SAVE PROGRESS
# ---------------------------------------------------------

def save_json(
        filename: str,
        data,
) -> None:

    with open(
            filename,
            "w",
            encoding="utf-8",
    ) as file:

        json.dump(
            data,
            file,
            indent=2,
            ensure_ascii=False,
        )


# ---------------------------------------------------------
# LOAD ROUND 1
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

    feedback_sets = json.load(file)


if not isinstance(feedback_sets, list):
    raise ValueError(
        f"{INPUT_FILE} must contain a JSON array."
    )


# ---------------------------------------------------------
# PROCESS ALL TESTERS
# ---------------------------------------------------------

candidates = []
errors = []

total = len(feedback_sets)

print()
print("=" * 72)
print("DAWGDECISION ROUND 1 — BATCH TRIAGE")
print("=" * 72)
print()


for index, feedback_set in enumerate(
        feedback_sets,
        start=1,
):

    source_id = feedback_set["id"]
    feedback = feedback_set["feedback"]

    print(
        f"[{index}/{total}] "
        f"Triaging {source_id}..."
    )

    try:
        batch = triage_feedback(
            source_feedback_id=source_id,
            feedback=feedback,
        )

        for observation in batch.items:
            candidates.append(
                observation.model_dump()
            )

        print(
            f"  -> {len(batch.items)} "
            "candidate observation(s)"
        )

    except Exception as error:

        errors.append(
            {
                "source_feedback_id": source_id,
                "error": str(error),
            }
        )

        print(
            f"  -> FAILED: {error}"
        )

    # Save after every tester so progress is never lost.
    save_json(
        OUTPUT_FILE,
        candidates,
    )

    save_json(
        ERROR_FILE,
        errors,
    )


# ---------------------------------------------------------
# FINAL SUMMARY
# ---------------------------------------------------------

print()
print("=" * 72)
print("BATCH TRIAGE COMPLETE")
print("=" * 72)

print(
    f"Tester sets processed: {total}"
)

print(
    f"Candidate observations: {len(candidates)}"
)

print(
    f"Failed tester sets: {len(errors)}"
)

print()
print(
    f"Review candidates in: {OUTPUT_FILE}"
)

if errors:
    print(
        f"Review failures in: {ERROR_FILE}"
    )