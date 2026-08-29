import json
import os
from typing import Literal

from openai import AsyncOpenAI
from agents import (
    Agent,
    Runner,
    OpenAIChatCompletionsModel,
    set_tracing_disabled,
    function_tool,
)
from pydantic import BaseModel, Field, ValidationError

set_tracing_disabled(True)

openrouter_client = AsyncOpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1",
)

model = OpenAIChatCompletionsModel(
    model="openrouter/free",
    openai_client=openrouter_client,
)


class TriageResult(BaseModel):
    category: Literal[
        "Bug",
        "Usability",
        "Feature Request",
        "Data Gap",
        "Content Clarity",
        "Performance",
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

    duplicate_status: Literal[
        "New",
        "Related Theme",
        "Likely Duplicate",
    ]

    related_feedback_ids: list[str]

    underlying_need: str
    summary: str

    confidence: float = Field(ge=0, le=1)

    jira_title: str
    jira_description: str


@function_tool
def search_existing_feedback(query: str) -> str:
    """Search previously recorded DawgDecision feedback for related issues."""
    with open("feedback_store.json", "r", encoding="utf-8") as file:
        feedback_items = json.load(file)

    query_words = set(query.lower().split())

    scored_items = []

    for item in feedback_items:
        searchable_text = (
            f"{item['summary']} "
            f"{item['product_area']} "
            f"{item['category']}"
        ).lower()

        score = sum(
            1
            for word in query_words
            if word in searchable_text
        )

        if score > 0:
            scored_items.append((score, item))

    scored_items.sort(key=lambda x: x[0], reverse=True)

    matches = [item for _, item in scored_items[:3]]

    return json.dumps(matches)

def save_approved_feedback(triage: TriageResult) -> str:
    """Save a human-approved non-duplicate feedback item."""
    with open("feedback_store.json", "r", encoding="utf-8") as file:
        feedback_items = json.load(file)

    next_number = max(
        (int(item["id"].split("-")[1]) for item in feedback_items),
        default=0,
    ) + 1

    feedback_id = f"FB-{next_number:03d}"

    new_item = {
        "id": feedback_id,
        "summary": triage.summary,
        "product_area": triage.product_area,
        "category": triage.category,
    }

    feedback_items.append(new_item)

    with open("feedback_store.json", "w", encoding="utf-8") as file:
        json.dump(feedback_items, file, indent=2)

    return feedback_id

agent = Agent(
    name="Feedback Triage Agent",
    instructions=(
        "You analyze feedback from users testing DawgDecision, "
        "a student financial decision-support product currently focused on housing comparisons. "

        "Classify each piece of feedback using exactly one of these categories: "
        "Bug, Usability, Feature Request, Data Gap, Content Clarity, Performance, Other. "

        "Map the feedback to exactly one of these product areas: "
        "Landing Page, Authentication, Navigation, Dashboard, Housing Compare, "
        "Housing Sources, Comparison Results, Financial Plan, Saved Financial Plans, General. "

        "Before producing the final triage result, use the search_existing_feedback tool "
        "to check whether the new feedback appears related to previously recorded feedback. "

        "Classify duplicate_status as exactly one of: New, Related Theme, Likely Duplicate. "
        "Use Likely Duplicate only when the new feedback describes essentially the same issue "
        "or requested improvement as an existing feedback item. "
        "Use Related Theme when it overlaps with an existing issue but describes a meaningfully "
        "different problem or request. "
        "Use New when no meaningful overlap exists. "

        "Populate related_feedback_ids with the IDs of relevant existing feedback items returned "
        "by the search tool. Use an empty list if none are meaningfully related. "

        "Use tool results only as supporting context. "
        "Do not claim something is related or duplicated simply because a few words overlap. "

        "Identify the underlying user need rather than merely repeating the user's wording. "

        "Write a short factual summary of the feedback. "

        "Assign confidence from 0 to 1 based on how clearly the feedback supports your interpretation. "

        "Create a concise Jira title describing the issue or requested improvement. "

        "Create a concise Jira description explaining what the user experienced or requested "
        "and what outcome they need. Keep it to 2-3 sentences. "
        "Do not prescribe an implementation unless the user explicitly requested one. "

        "Never invent users, subscribers, product features, technical causes, "
        "business requirements, or other context that is not supported by the feedback. "

        "Return ONLY valid JSON with exactly these fields: "
        "category, product_area, duplicate_status, related_feedback_ids, "
        "underlying_need, summary, confidence, jira_title, jira_description. "

        "Do not use markdown. Do not use code fences. Do not include text outside the JSON."
    ),
    model=model,
    tools=[search_existing_feedback],
)


def triage_feedback(feedback: str, max_attempts: int = 3) -> TriageResult:
    for attempt in range(max_attempts):
        prompt = feedback

        if attempt > 0:
            prompt = (
                "Return ONLY valid JSON following the required schema. "
                "Use search_existing_feedback before producing the final result. "
                "Do not include markdown or any additional text.\n\n"
                f"User feedback:\n{feedback}"
            )

        result = Runner.run_sync(agent, prompt)

        try:
            data = json.loads(result.final_output)
            return TriageResult.model_validate(data)

        except (json.JSONDecodeError, ValidationError):
            if attempt == max_attempts - 1:
                raise

    raise RuntimeError("Triage failed unexpectedly.")


feedback = input("Paste tester feedback:\n\n")

triage = triage_feedback(feedback)

print("\nTriage result:\n")

print(f"Category: {triage.category}")
print(f"Product area: {triage.product_area}")
print(f"Duplicate status: {triage.duplicate_status}")
print(f"Related feedback IDs: {triage.related_feedback_ids}")
print(f"Underlying need: {triage.underlying_need}")
print(f"Summary: {triage.summary}")
print(f"Confidence: {triage.confidence:.2f}")
print(f"Jira title: {triage.jira_title}")
print(f"Jira description: {triage.jira_description}")

approval = input("\nApprove this triage result? (y/n): ").strip().lower()

if approval == "y":
    if triage.duplicate_status == "Likely Duplicate":
        print(
            "Approved as a likely duplicate. "
            f"No new feedback item created. Related to: {triage.related_feedback_ids}"
        )
    else:
        feedback_id = save_approved_feedback(triage)
        print(f"Approved and saved as {feedback_id}.")
else:
    print("Not approved. No changes were saved.")