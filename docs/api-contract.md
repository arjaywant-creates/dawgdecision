# API Contract

## Purpose

This document defines the MVP API contract between the React/Next.js frontend, FastAPI backend, persistence layer, and DawgDecision decision engine.

The contract reflects:

- the Housing v1 comparison model used in Deliverable Set 4
- the Financial Plan and Decision Impact model used in Deliverable Set 5

The decision engine remains the source of truth for all housing-comparison calculations, tradeoff logic, and decision-impact calculations.

The FastAPI layer should expose that behavior rather than reimplement it.

---

The current API supports:

- Individual housing scenario analysis
- Two-scenario housing comparison
- Authentication-backed user access
- Saved comparisons
- Persistent comparison retrieval, updating, and deletion
- Financial Plan housing selection
- Decision-impact analysis for the selected housing option

The current housing model is intentionally an MVP model and may change before private beta. Persistence should therefore avoid unnecessarily coupling the rest of the application to the exact current housing fields.

---

# Base Behavior

The FastAPI layer is responsible for:

1. Receiving request data.
2. Validating request structure.
3. Converting request data into decision-engine models.
4. Calling the decision engine.
5. Returning structured results to the frontend.
6. Enforcing authentication and ownership where persistence is involved.
7. Persisting Financial Plan selections.

The FastAPI layer should not duplicate financial calculations, tradeoff logic, or decision-impact logic already implemented in the decision engine.

---

# Housing Scenario Model

Each housing option uses the following fields.

## Required Fields

- `name`
- `housing_cost`
- `cost_period_months`
- `contract_months`

## Optional Fields

- `utilities`
- `mandatory_fees`
- `parking`
- `transportation`
- `upfront_costs`
- `commute_minutes`

Optional values may be `null`.

Important:

- `null` means unknown or not provided.
- `0` means the value is explicitly known to be zero.

The backend and frontend must preserve this distinction.

Example:

```json
{
  "name": "Apartment A",
  "housing_cost": 1200,
  "cost_period_months": 1,
  "contract_months": 12,
  "utilities": 110,
  "mandatory_fees": 35,
  "parking": 60,
  "transportation": 80,
  "upfront_costs": 620,
  "commute_minutes": 20
}
```

---

# Existing Comparison API

## POST /api/analyze

Analyzes one housing scenario using the decision engine.

The backend should convert the incoming request into a `Scenario`, call the decision engine, and return the resulting analysis.

---

## POST /api/compare

Compares two housing scenarios.

### Request

```json
{
  "scenario_a": {
    "name": "Apartment A",
    "housing_cost": 900,
    "cost_period_months": 1,
    "contract_months": 12,
    "utilities": 100,
    "mandatory_fees": 50,
    "parking": 50,
    "transportation": 100,
    "upfront_costs": 600,
    "commute_minutes": 20
  },
  "scenario_b": {
    "name": "Apartment B",
    "housing_cost": 1000,
    "cost_period_months": 1,
    "contract_months": 12,
    "utilities": 75,
    "mandatory_fees": 25,
    "parking": 25,
    "transportation": 50,
    "upfront_costs": 300,
    "commute_minutes": 10
  }
}
```

### Response Naming

The request uses:

- `scenario_a`
- `scenario_b`

The comparison response currently uses:

- `first_result`
- `second_result`

This is intentional for the current MVP and should not be renamed unless the contract is updated first.

---

# Set 5 — Financial Plan

## Purpose

The Financial Plan stores the user's currently selected housing decision.

For the MVP:

- only one housing option may be active in the Financial Plan per user
- the selection must reference an existing saved comparison
- the selection must identify whether Scenario A or Scenario B was chosen
- the Financial Plan must use the latest data from that saved comparison
- housing calculations should not be copied into a separate stale snapshot

The Financial Plan should answer:

> What am I committing to, and what am I giving up by choosing this option?

The decision-impact engine provides the deterministic analysis used to answer that question.

---

# Selected Scenario Naming

There are two different meanings of `selected_scenario` in the current Set 5 implementation.

This distinction must be preserved.

## API / Persistence Meaning

In Financial Plan requests and stored selections:

```json
{
  "selected_scenario": "B"
}
```

`selected_scenario` means:

- `"A"`
- or `"B"`

It identifies which side of the saved comparison the user selected.

## Decision Engine Meaning

Inside `DecisionImpactResult`:

```json
{
  "selected_scenario": "Apartment B",
  "alternative_scenario": "Apartment A"
}
```

These fields contain the human-readable scenario names.

Therefore:

- Financial Plan `selected_scenario` = `"A"` or `"B"`
- Decision Impact `selected_scenario` = scenario name
- Decision Impact `alternative_scenario` = scenario name

The frontend and backend must not assume these fields contain the same type of value.

---

# PUT /api/financial-plan/housing

Creates or replaces the active housing selection in the authenticated user's Financial Plan.

## Request

```json
{
  "comparison_id": "abc123",
  "selected_scenario": "B"
}
```

## Rules

- `selected_scenario` must be `"A"` or `"B"`.
- `comparison_id` must reference a saved comparison owned by the authenticated user.
- If the user already has an active housing selection, the existing selection should be replaced.
- The operation must not create multiple active housing selections.
- The saved comparison itself should remain unchanged.
- Decision-impact calculations must come from the existing decision engine.

---

# GET /api/financial-plan

Returns the authenticated user's current Financial Plan.

## Active Housing Response

```json
{
  "housing": {
    "comparison_id": "abc123",
    "selected_scenario": "B",
    "selected_result": {
      "scenario_name": "Apartment B",
      "monthly_recurring_cost": 1175,
      "upfront_costs": 300,
      "term_cost": 14400,
      "contract_months": 12,
      "recurring_costs_complete": true,
      "term_cost_complete": true,
      "missing_recurring_costs": []
    },
    "impact": {
      "selected_scenario": "Apartment B",
      "alternative_scenario": "Apartment A",

      "monthly_commitment_delta": -25,
      "upfront_commitment_delta": -300,
      "term_commitment_delta": -600,
      "commute_delta": -10,

      "category_deltas": [
        {
          "category": "housing",
          "difference": 100
        },
        {
          "category": "utilities",
          "difference": -25
        },
        {
          "category": "mandatory_fees",
          "difference": -25
        },
        {
          "category": "parking",
          "difference": -25
        },
        {
          "category": "transportation",
          "difference": -50
        }
      ],

      "largest_cost_increase": {
        "category": "housing",
        "difference": 100
      },

      "largest_cost_offset": {
        "category": "transportation",
        "difference": -50
      },

      "break_even_months": null,

      "extra_monthly_cost_for_shorter_commute": null,
      "commute_minutes_saved": null,

      "approximate_daily_delta": -0.83,

      "monthly_comparison_complete": true,
      "term_comparison_complete": true,
      "commute_comparison_complete": true
    }
  }
}
```

---

# selected_result

`selected_result` represents the currently selected Scenario A or Scenario B.

It should expose the values needed by the Financial Plan UI without requiring the frontend to infer which comparison result was selected.

At minimum it should include:

- `scenario_name`
- `monthly_recurring_cost`
- `upfront_costs`
- `term_cost`
- `contract_months`
- `recurring_costs_complete`
- `term_cost_complete`
- `missing_recurring_costs`

`contract_months` may be read from the selected `Scenario` when building this response.

It does not need to be added to `DecisionResult` solely for Financial Plan support.

---

# Decision Impact Response

The `impact` object should come from the existing deterministic decision-impact engine.

The API should call:

`analyze_decision_impact(...)`

rather than reimplementing the calculations.

Decision-impact output may include:

- `selected_scenario`
- `alternative_scenario`
- `monthly_commitment_delta`
- `upfront_commitment_delta`
- `term_commitment_delta`
- `commute_delta`
- `category_deltas`
- `largest_cost_increase`
- `largest_cost_offset`
- `break_even_months`
- `extra_monthly_cost_for_shorter_commute`
- `commute_minutes_saved`
- `approximate_daily_delta`
- `monthly_comparison_complete`
- `term_comparison_complete`
- `commute_comparison_complete`

A `null` value means the analysis could not be calculated honestly from the available information or that the specific insight does not apply.

The frontend must not replace `null` with a calculated value of its own.

---

# Delta Semantics

Decision-impact deltas are calculated from the selected scenario's perspective.

## Financial Deltas

Positive:

```text
selected option costs more
```

Negative:

```text
selected option costs less
```

Example:

```json
{
  "monthly_commitment_delta": 75
}
```

means:

> The selected option costs $75 more per month.

Example:

```json
{
  "monthly_commitment_delta": -75
}
```

means:

> The selected option saves $75 per month.

## Commute Delta

Negative:

```text
selected option has a shorter commute
```

Positive:

```text
selected option has a longer commute
```

Example:

```json
{
  "commute_delta": -10
}
```

means:

> The selected option has a 10-minute shorter commute.

---

# Empty Financial Plan

If the authenticated user has no active housing selection:

```json
{
  "housing": null
}
```

This is a valid state.

It should not produce an error.

The frontend should display the Financial Plan empty state.

---

# Switching Housing Options

The user may switch between Scenario A and Scenario B.

Example initial request:

```json
{
  "comparison_id": "abc123",
  "selected_scenario": "A"
}
```

Later:

```json
{
  "comparison_id": "abc123",
  "selected_scenario": "B"
}
```

The second request should update the existing active housing selection.

It must not create a duplicate Financial Plan housing record.

---

# DELETE /api/financial-plan/housing

Removes the user's active housing selection.

This operation must not delete the underlying saved comparison.

After removal, the Financial Plan should return:

```json
{
  "housing": null
}
```

---

# Saved Comparison Updates

The Financial Plan should reference the saved comparison instead of maintaining a separate independent copy of its calculated values.

If a saved comparison is edited:

1. The comparison's updated Scenario A and Scenario B values are persisted.
2. The Financial Plan continues referencing the same comparison.
3. The next Financial Plan request loads the latest scenario values.
4. Decision-impact analysis is recalculated from those latest values.
5. The frontend therefore receives the latest selected-result and impact data.

No separate Financial Plan recalculation workflow should be required.

---

# Saved Comparison Deletion

A Financial Plan must never retain a broken saved-comparison reference.

If a saved comparison currently used by the Financial Plan is deleted:

- the associated Financial Plan housing selection should also be removed

A subsequent:

```text
GET /api/financial-plan
```

should return:

```json
{
  "housing": null
}
```

The comparison deletion should not leave an invalid or inaccessible Financial Plan state.

---

# Ownership and Authentication

Financial Plan endpoints require authentication.

A user may only:

- add one of their own saved comparisons to their Financial Plan
- retrieve their own Financial Plan
- switch their own selected scenario
- remove their own Financial Plan selection

A user must not be able to attach another user's comparison by manually supplying its `comparison_id`.

Ownership checks must be enforced by the backend.

Frontend hiding is not sufficient security.

---

# Decision Impact Responsibility

## Decision Engine

Responsible for:

- monthly commitment deltas
- upfront commitment deltas
- full-term commitment deltas
- commute deltas
- category deltas
- largest cost increase
- largest cost offset
- break-even analysis
- commute-cost tradeoff analysis
- approximate daily delta
- completeness logic

## FastAPI / Persistence Layer

Responsible for:

- authentication
- ownership enforcement
- Financial Plan persistence
- loading the saved comparison
- resolving Scenario A or Scenario B
- calling the decision-impact engine
- constructing the Financial Plan response
- serializing decision-engine output

The backend should not recreate decision-impact formulas.

## Frontend

Responsible for:

- Scenario A / Scenario B selection UI
- Financial Plan page presentation
- displaying selected housing details
- displaying decision-impact results
- displaying incomplete / unknown states
- switch controls
- remove controls
- loading states
- empty states
- error states

The frontend should not recreate decision-impact formulas.

---

# Set 5 MVP Constraints

For the MVP:

- only housing is supported in the Financial Plan
- only one housing selection may be active at a time
- the Financial Plan references a saved comparison
- no overall recommendation score should be generated
- no preference weighting should be implemented
- no affordability judgment should be generated
- no AI recommendation layer should be added
- no income tracking is required
- no generic budgeting dashboard is required
- no additional decision categories are required

The goal of Set 5 is to make the selected housing decision understandable and 
persistent without expanding the application into a general financial-planning system.