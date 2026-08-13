# API Contract

## Purpose

This document defines the API contract between the DawgDecision frontend, FastAPI backend, and decision engine.

The current implementation supports:

- Individual housing scenario analysis
- Two-scenario housing comparison

Deliverable Set 3 adds:

- Authentication-backed user access
- Saved comparisons
- Persistent comparison retrieval, updating, and deletion

The current housing model is intentionally an MVP model and may change before private beta. Persistence should therefore avoid unnecessarily coupling the rest of the application to the exact current housing fields.

---

# Base Behavior

The FastAPI layer is responsible for:

1. Receiving and validating request data.
2. Converting request data into decision-engine models.
3. Calling the decision engine.
4. Returning structured results to the frontend.
5. Handling persistence for authenticated users.
6. Enforcing ownership of user-specific data.

The FastAPI layer should not duplicate financial calculations performed by the decision engine.

---

# Current Scenario Model

A housing scenario currently contains:

```json
{
  "name": "Apartment A",
  "monthly_income": 2000,
  "rent": 900,
  "utilities": 100,
  "transportation": 150,
  "mandatory_fees": 50,
  "other_expenses": 100,
  "lease_months": 12
}
```

All financial values currently represent monthly amounts unless otherwise stated.

`monthly_income` is part of the current MVP model and may be replaced by a more flexible student funding model before private beta.

---

# Analyze One Scenario

## Endpoint

`POST /api/analyze`

## Authentication

Not required.

## Purpose

Analyzes one housing scenario and returns its calculated financial results.

## Request

```json
{
  "name": "Apartment A",
  "monthly_income": 2000,
  "rent": 900,
  "utilities": 100,
  "transportation": 150,
  "mandatory_fees": 50,
  "other_expenses": 100,
  "lease_months": 12
}
```

## Response

```json
{
  "scenario_name": "Apartment A",
  "monthly_expenses": 1300,
  "lease_expenses": 15600,
  "monthly_surplus": 700,
  "lease_surplus": 8400
}
```

---

# Compare Two Scenarios

## Endpoint

`POST /api/compare`

## Authentication

Not required.

## Purpose

Analyzes two housing scenarios and returns their financial comparison.

## Request

```json
{
  "scenario_a": {
    "name": "Apartment A",
    "monthly_income": 2000,
    "rent": 900,
    "utilities": 100,
    "transportation": 150,
    "mandatory_fees": 50,
    "other_expenses": 100,
    "lease_months": 12
  },
  "scenario_b": {
    "name": "Apartment B",
    "monthly_income": 2000,
    "rent": 1050,
    "utilities": 75,
    "transportation": 50,
    "mandatory_fees": 25,
    "other_expenses": 0,
    "lease_months": 12
  }
}
```

## Response

```json
{
  "first_result": {
    "scenario_name": "Apartment A",
    "monthly_expenses": 1300,
    "lease_expenses": 15600,
    "monthly_surplus": 700,
    "lease_surplus": 8400
  },
  "second_result": {
    "scenario_name": "Apartment B",
    "monthly_expenses": 1200,
    "lease_expenses": 14400,
    "monthly_surplus": 800,
    "lease_surplus": 9600
  },
  "lower_monthly_cost_scenario": "Apartment B",
  "monthly_difference": 100
}
```

If both scenarios have the same monthly cost:

```json
{
  "lower_monthly_cost_scenario": "Tie",
  "monthly_difference": 0
}
```

---

# Authentication

Deliverable Set 3 introduces authenticated persistence.

The exact authentication transport and session implementation may be determined by the Platform & Backend Engineer, but the following behavior is required.

## Required Behavior

The backend must be able to:

- Create/authenticate users.
- Identify the currently authenticated user.
- End the user's authenticated session.
- Reject protected requests when no valid authenticated user exists.
- Associate persistent user data with the authenticated user.

The frontend is responsible for providing the signup, login, and logout interfaces.

Using `/api/analyze` and `/api/compare` does not require authentication.

Saving or managing persistent comparisons does require authentication.

---

# Saved Comparison Model

A saved comparison represents one completed two-scenario comparison.

Each saved comparison should contain:

- Unique comparison ID
- Owning user ID
- Comparison name
- Scenario A inputs
- Scenario B inputs
- Calculated comparison results
- Created timestamp
- Updated timestamp

Conceptually:

```text
User
└── has many Comparisons

Comparison
├── belongs to one User
├── contains Scenario A
├── contains Scenario B
├── contains comparison results
└── may later be referenced by Financial Plans
```

A future Financial Plan should be able to reference a saved comparison without requiring the current housing schema to become permanent.

---

# Save Comparison

## Endpoint

`POST /api/comparisons`

## Authentication

Required.

## Purpose

Permanently saves a completed comparison for the authenticated user.

## Request

```json
{
  "name": "Apartment A vs Apartment B",
  "scenario_a": {
    "name": "Apartment A",
    "monthly_income": 2000,
    "rent": 900,
    "utilities": 100,
    "transportation": 150,
    "mandatory_fees": 50,
    "other_expenses": 100,
    "lease_months": 12
  },
  "scenario_b": {
    "name": "Apartment B",
    "monthly_income": 2000,
    "rent": 1050,
    "utilities": 75,
    "transportation": 50,
    "mandatory_fees": 25,
    "other_expenses": 0,
    "lease_months": 12
  },
  "results": {
    "first_result": {
      "scenario_name": "Apartment A",
      "monthly_expenses": 1300,
      "lease_expenses": 15600,
      "monthly_surplus": 700,
      "lease_surplus": 8400
    },
    "second_result": {
      "scenario_name": "Apartment B",
      "monthly_expenses": 1200,
      "lease_expenses": 14400,
      "monthly_surplus": 800,
      "lease_surplus": 9600
    },
    "lower_monthly_cost_scenario": "Apartment B",
    "monthly_difference": 100
  }
}
```

The client must not choose or submit the owner `user_id`.

The backend determines ownership from the authenticated user.

## Response

Example:

```json
{
  "id": "comparison-id",
  "name": "Apartment A vs Apartment B",
  "scenario_a": {},
  "scenario_b": {},
  "results": {},
  "created_at": "2026-08-13T17:30:00Z",
  "updated_at": "2026-08-13T17:30:00Z"
}
```

The exact ID representation may be determined by the backend implementation.

---

# List Saved Comparisons

## Endpoint

`GET /api/comparisons`

## Authentication

Required.

## Purpose

Returns saved comparisons belonging to the currently authenticated user.

The endpoint must not return comparisons belonging to another user.

## Response

```json
[
  {
    "id": "comparison-id",
    "name": "Apartment A vs Apartment B",
    "created_at": "2026-08-13T17:30:00Z",
    "updated_at": "2026-08-13T17:30:00Z"
  }
]
```

The backend may return additional useful summary fields if needed by the frontend.

---

# Retrieve One Saved Comparison

## Endpoint

`GET /api/comparisons/{id}`

## Authentication

Required.

## Purpose

Returns the complete saved comparison so the frontend can restore the scenarios and results.

## Response

```json
{
  "id": "comparison-id",
  "name": "Apartment A vs Apartment B",
  "scenario_a": {
    "name": "Apartment A",
    "monthly_income": 2000,
    "rent": 900,
    "utilities": 100,
    "transportation": 150,
    "mandatory_fees": 50,
    "other_expenses": 100,
    "lease_months": 12
  },
  "scenario_b": {
    "name": "Apartment B",
    "monthly_income": 2000,
    "rent": 1050,
    "utilities": 75,
    "transportation": 50,
    "mandatory_fees": 25,
    "other_expenses": 0,
    "lease_months": 12
  },
  "results": {
    "first_result": {
      "scenario_name": "Apartment A",
      "monthly_expenses": 1300,
      "lease_expenses": 15600,
      "monthly_surplus": 700,
      "lease_surplus": 8400
    },
    "second_result": {
      "scenario_name": "Apartment B",
      "monthly_expenses": 1200,
      "lease_expenses": 14400,
      "monthly_surplus": 800,
      "lease_surplus": 9600
    },
    "lower_monthly_cost_scenario": "Apartment B",
    "monthly_difference": 100
  },
  "created_at": "2026-08-13T17:30:00Z",
  "updated_at": "2026-08-13T17:30:00Z"
}
```

---

# Update Saved Comparison

## Endpoint

`PUT /api/comparisons/{id}`

## Authentication

Required.

## Purpose

Updates an existing comparison belonging to the authenticated user.

This is intended for the following flow:

1. User loads a saved comparison.
2. User changes one or both scenarios.
3. User runs the comparison again.
4. User saves the updated version.

The request should contain the updated comparison name, scenario inputs, and results.

The backend updates `updated_at`.

The original `created_at` should remain unchanged.

---

# Delete Saved Comparison

## Endpoint

`DELETE /api/comparisons/{id}`

## Authentication

Required.

## Purpose

Permanently deletes one saved comparison belonging to the authenticated user.

The frontend should request confirmation before sending the delete request.

Example confirmation:

`Delete this saved comparison?`

No trash or recovery system is required for the current MVP.

---

# Ownership Rules

Ownership must be enforced by the backend.

For every protected comparison endpoint:

```text
User A may:
- create comparisons belonging to User A
- list User A's comparisons
- retrieve User A's comparisons
- update User A's comparisons
- delete User A's comparisons

User A may not:
- retrieve User B's comparisons
- update User B's comparisons
- delete User B's comparisons
```

The frontend hiding another user's data is not sufficient protection.

The backend must validate ownership for every individual comparison operation.

---

# Unauthenticated Behavior

Unauthenticated users may:

- Open the Compare page.
- Enter scenarios.
- Run `/api/analyze`.
- Run `/api/compare`.

Unauthenticated users may not:

- Save comparisons.
- List saved comparisons.
- Retrieve saved comparisons.
- Update saved comparisons.
- Delete saved comparisons.

If an unauthenticated user attempts to save through the frontend, the frontend should display:

`Sign in to save this comparison.`

The user's current comparison inputs should not be discarded merely because authentication is required.

Protected backend endpoints should return the appropriate authentication error when no valid authenticated session exists.

---

# Frontend Save/Load Behavior

## Saving

After a successful comparison, the frontend may offer:

`Save Comparison`

If authenticated:

1. Send the comparison to `POST /api/comparisons`.
2. Show a clear success or failure state.

If unauthenticated:

1. Do not discard the current comparison.
2. Ask the user to sign in.

Autosaving every field change is outside the current scope.

## Loading

When the user opens a saved comparison:

1. Restore Scenario A inputs.
2. Restore Scenario B inputs.
3. Restore the saved comparison result.
4. Allow the user to edit the scenarios.
5. Allow the user to run Compare again.
6. Allow the updated comparison to be saved.

---

# Error Behavior

The API should return appropriate HTTP status codes for:

- Invalid request data
- Missing authentication
- Comparison not found
- Comparison owned by another user
- Database/persistence failures

Detailed internal errors should not be exposed directly to end users.

The frontend should convert technical failures into readable messages.

---

# Existing Behavior That Must Remain Intact

Deliverable Set 3 must not break:

- `POST /api/analyze`
- `POST /api/compare`
- Current Scenario validation
- Current housing calculations
- Current comparison calculations
- Current Compare frontend integration
- Existing backend tests

Persistence and authentication extend the existing application; they do not replace the decision engine.

---

# Future Expansion

Future versions may add:

- Financial Plans referencing saved comparisons
- More flexible student funding models
- Additional decision categories
- Sourced housing and transportation data
- Scenario versioning
- Consolidated financial plans
- Recommendation or tradeoff scoring
- Optional AI-generated explanations
- More advanced financial calculations

These future features are outside Deliverable Set 3.