# DawgDecision Feedback Triage Agent

Internal agentic AI tool for triaging feedback collected during DawgDecision user testing.

## Purpose

The Feedback Triage Agent turns raw tester feedback into structured product feedback while checking previously recorded issues for potential overlap.

The workflow keeps a human in control of whether new feedback is persisted.

## Workflow

1. Accept raw tester feedback.
2. Classify the feedback by category and product area.
3. Use `search_existing_feedback` to search the existing feedback store.
4. Determine whether the feedback is:
    - `New`
    - `Related Theme`
    - `Likely Duplicate`
5. Identify the underlying user need.
6. Generate a concise summary and Jira-ready issue draft.
7. Request human approval.
8. Conditionally persist the feedback:
    - `New` → save as a new feedback item after approval.
    - `Related Theme` → save separately while retaining related feedback IDs.
    - `Likely Duplicate` → associate with existing feedback without creating a duplicate item.
    - Rejected → make no persistent change.

## Architecture

```text
Raw Tester Feedback
        |
        v
Feedback Triage Agent
        |
        v
search_existing_feedback()
        |
        v
feedback_store.json
        |
        v
New / Related Theme / Likely Duplicate
        |
        v
Structured Triage + Jira Draft
        |
        v
Human Approval
        |
        v
Conditional Persistence