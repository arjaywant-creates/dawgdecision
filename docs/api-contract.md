# API Contract

## Purpose

This document defines the MVP API contract between the React/Next.js frontend, FastAPI backend, persistence layer, and DawgDecision decision engine.

The contract reflects:

- the Housing v1 comparison model used in Deliverable Set 4
- the Financial Plan and Decision Impact model used in Deliverable Set 5
- the Sourced Housing Data model used in Deliverable Set 6

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
- Curated sourced housing data

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
8. Exposing the curated sourced-housing dataset.

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

# Set 5 - Financial Plan

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

The goal of Set 5 is to make the selected housing decision understandable and persistent without expanding the application into a general financial-planning system.

---

# Set 6 - Sourced Housing Data

## Purpose

Set 6 adds an optional sourced-data layer to the existing Housing Comparison flow.

The goal is to make comparison setup faster and more trustworthy by allowing users to prefill housing fields from a small curated dataset.

Sourced data does not replace manual entry.

Users must be able to:

- use sourced data for Scenario A
- use sourced data for Scenario B
- use sourced data for only one side
- ignore sourced data entirely and enter both scenarios manually

The existing comparison, saving, decision-impact, and Financial Plan behavior should remain unchanged.

---

# Canonical Sourced Housing Dataset

The canonical MVP dataset lives at:

```text
data/housing_sources.json
```

The dataset currently contains:

- 5 on-campus housing configurations
- 5 off-campus apartment configurations

Each option represents a specific housing configuration rather than only a property/building.

Example:

```text
Payne Hall - Double with community bath
```

rather than:

```text
Payne Hall
```

---

# Sourced Housing Model

Each sourced option uses the following structure:

```json
{
  "id": "payne_double_community",
  "category": "on_campus",
  "property_name": "Payne Hall",
  "configuration": "Double with community bath",
  "housing_cost": 3411,
  "price_type": "term_rate",
  "cost_period_months": 4,
  "contract_months": 8,
  "utilities": null,
  "mandatory_fees": 0,
  "parking": null,
  "transportation": null,
  "upfront_costs": null,
  "commute_minutes": null,
  "source": {
    "name": "UGA University Housing",
    "url": "https://housing.uga.edu/rates/",
    "last_checked": "2026-08-25",
    "notes": "2026-27 rate per resident per term. Programming fee included in published rate."
  }
}
```

The canonical JSON file is the source of truth for the exact current entries and values.

---

# Sourced Housing Categories

`category` currently supports:

```text
on_campus
off_campus
```

The frontend should display these as:

```text
On-campus
Off-campus
```

Additional categories are not required for Set 6.

---

# Price Types

`price_type` provides machine-readable context for the published housing price.

Current supported values:

```text
term_rate
starting_at
starting_inclusive_installment
```

## term_rate

The published housing cost represents a rate for a defined academic term.

Example:

```json
{
  "housing_cost": 3411,
  "price_type": "term_rate",
  "cost_period_months": 4
}
```

The frontend should make clear that the source publishes this as a term-based rate.

## starting_at

The published value is an advertised starting price.

Example:

```json
{
  "housing_cost": 459,
  "price_type": "starting_at"
}
```

The frontend should use language such as:

```text
Starting at $459/month
```

rather than presenting the value as a guaranteed fixed price.

## starting_inclusive_installment

The published value is a starting monthly installment that already includes known mandatory monthly fees.

Example:

```json
{
  "housing_cost": 1037.95,
  "price_type": "starting_inclusive_installment"
}
```

The frontend should preserve the fact that the value is a starting price.

The backend and frontend should use `price_type` rather than attempting to infer price semantics from `source.notes`.

---

# Sourced Null and Zero Semantics

The existing Housing v1 semantics remain unchanged:

```text
null = unknown, unavailable, or not provided by the source
0    = explicitly known to be zero or already included
```

Example:

```json
{
  "utilities": null
}
```

means the complete utilities cost is not known.

Example:

```json
{
  "parking": 0
}
```

means standard parking is explicitly known to have no additional cost.

Sourced data must never convert an unknown value into zero.

---

# GET /api/housing-sources

Returns all currently supported sourced housing options.

For the MVP, the endpoint may return the complete curated dataset.

## Response

```json
{
  "housing_options": [
    {
      "id": "payne_double_community",
      "category": "on_campus",
      "property_name": "Payne Hall",
      "configuration": "Double with community bath",
      "housing_cost": 3411,
      "price_type": "term_rate",
      "cost_period_months": 4,
      "contract_months": 8,
      "utilities": null,
      "mandatory_fees": 0,
      "parking": null,
      "transportation": null,
      "upfront_costs": null,
      "commute_minutes": null,
      "source": {
        "name": "UGA University Housing",
        "url": "https://housing.uga.edu/rates/",
        "last_checked": "2026-08-25",
        "notes": "2026-27 rate per resident per term. Programming fee included in published rate."
      }
    }
  ]
}
```

Pagination, external-source fetching, and dynamic search infrastructure are not required for Set 6.

---

# GET /api/housing-sources/{id}

Returns one sourced housing option.

Example:

```text
GET /api/housing-sources/payne_double_community
```

The response should use the same shape as an individual entry from `housing_sources.json`.

If the ID does not exist, the endpoint should return the normal API not-found response.

---

# Sourced Housing Authentication

Reading sourced housing data should not require authentication.

Guest users must be able to access sourced options in the existing guest Compare flow.

Existing authentication requirements remain unchanged for persistence behavior such as:

- saving comparisons
- modifying saved comparisons
- adding housing to the Financial Plan
- retrieving the Financial Plan

---

# Manual vs. Sourced Entry

Each comparison side must support:

```text
Manual input
Sourced housing
```

Manual input remains fully supported.

Selecting sourced housing is never required.

The following combinations must all work:

```text
manual A vs manual B
sourced A vs manual B
manual A vs sourced B
sourced A vs sourced B
```

Scenario A and Scenario B must select their modes independently.

---

# Applying Sourced Data

When a sourced housing option is selected for Scenario A or Scenario B:

1. The housing name should be populated from the sourced property and configuration.
2. Every known Scenario-compatible field should be populated.
3. `null` sourced values should remain blank/unknown.
4. Source name should be displayed.
5. Source URL should be available to the user.
6. Last-checked date should be displayed.
7. `price_type` should be reflected in the UI.
8. All populated comparison fields should remain editable.

The sourced dataset is an input-assistance layer.

It does not bypass existing Housing v1 validation or the decision engine.

---

# Sourced Housing Name

When a sourced option is selected, the Scenario name should contain enough information to identify the selected configuration.

Example:

```text
Payne Hall - Double with community bath
```

Example:

```text
The Mark Athens - Davis I - 4x4
```

The frontend should not reduce a sourced configuration to only its property name.

---

# Unknown Required Fields

Some sourced records intentionally contain:

```json
{
  "contract_months": null
}
```

because the verified source did not establish a reliable value.

`contract_months` remains required by the Housing v1 Scenario model.

When a sourced option contains an unknown required field:

- populate all known fields
- leave the unknown required field blank
- indicate that the source did not provide the value
- require the user to complete the field before comparison

The frontend must not invent the value.

The backend must not substitute a default value.

---

# User Editing of Sourced Data

All sourced values must remain editable after population.

If a user edits a sourced value, the comparison must use the edited value.

Example:

```text
Sourced housing cost: $1,037.95
User changes housing cost to: $1,100
```

The comparison should use:

```text
$1,100
```

The UI should no longer imply that the edited value itself came directly from the external source.

For the MVP, a simple indicator such as:

```text
Edited by you
```

is sufficient.

The original source metadata may remain visible for context.

---

# Source Metadata

At minimum, the sourced-data UI should expose:

- source name
- source URL
- last-checked date

Example:

```text
Source: UGA University Housing
Checked: Aug. 25, 2026
View source
```

`source.notes` may also be displayed when relevant.

Useful source notes include information such as:

```text
Starting monthly price
Rate per resident per term
Utilities billed separately
Parking included
Annual fee not represented in current calculation
```

Source caveats that materially affect interpretation of a value should not be hidden.

---

# Source Freshness

`source.last_checked` represents the date when the curated value was last manually verified.

It does not guarantee that the external source has not changed since that date.

Set 6 does not require:

- automatic refresh
- scheduled scraping
- price-change monitoring
- stale-data alerts

The frontend should display the last-checked date so users can understand the age of the sourced information.

---

# Dorm Rate Normalization

UGA residence-hall rates are published per academic term.

For the Set 6 MVP dataset, DawgDecision uses:

```text
cost_period_months = 4
contract_months = 8
```

This represents:

- one published term normalized across four months
- a standard fall + spring commitment represented across eight months

This is a DawgDecision product-model convention used to make term-based rates compatible with the existing Housing v1 calculation engine.

It should not be represented as if UGA explicitly publishes four-month or eight-month housing contracts.

The original term-rate context should remain visible through source metadata.

---

# Included Mandatory Fees

Some sourced apartment prices are published as inclusive monthly installments.

For these records:

```text
mandatory_fees = 0
```

means:

> No additional known mandatory monthly fee should be added on top of the stored `housing_cost`.

It does not necessarily mean that the property has no fees.

Relevant exclusions, optional fees, annual fees, and one-time charges should remain documented in `source.notes`.

---

# Sourced Data and Comparison

After sourced data populates a Scenario, the existing comparison flow remains unchanged.

The request to:

```text
POST /api/compare
```

continues to use the normal Housing Scenario shape.

The decision engine does not need a separate sourced-housing calculation path.

By the time a Scenario reaches the comparison engine, sourced values and user-entered values are treated as Scenario inputs.

---

# Sourced Data and Saved Comparisons

A saved comparison should persist the actual Scenario values used in the comparison.

The MVP does not require a saved comparison to dynamically update if `housing_sources.json` changes later.

The intended flow is:

```text
sourced preset
→ populate Scenario
→ user edits/completes fields if needed
→ compare
→ save comparison
```

The saved comparison represents what the user actually compared at that time.

---

# Sourced Data and Financial Plan

Set 5 Financial Plan behavior remains unchanged.

A sourced housing option reaches the Financial Plan through the existing flow:

```text
select sourced option
→ populate Scenario
→ compare
→ save comparison
→ select Scenario A or Scenario B
→ Financial Plan
```

The Financial Plan should continue using the saved comparison and decision-impact engine.

It should not independently load current calculation values from `housing_sources.json`.

The Financial Plan may display source context if that context is preserved by the comparison implementation.

Sourced housing must not create a separate Financial Plan calculation path.

---

# Set 6 Backend Responsibilities

The backend is responsible for:

- reading the canonical `data/housing_sources.json` dataset
- validating its structure
- exposing the sourced-housing endpoints
- preserving null/zero semantics
- preserving `price_type`
- preserving source metadata
- returning source entries without inventing missing values
- handling nonexistent sourced-option IDs
- backend/API tests

The backend should stop at the sourced-data API boundary.

The backend should not implement the production Compare UI for sourced housing.

---

# Set 6 Frontend Responsibilities

The frontend is responsible for:

- adding the optional sourced-data control to Scenario A
- adding the optional sourced-data control to Scenario B
- preserving manual input
- grouping sourced options into On-campus and Off-campus
- displaying specific housing configurations
- loading sourced options from the backend
- applying known sourced values to the existing Scenario form
- leaving unknown sourced values blank
- requiring unknown required fields before comparison
- displaying source name
- displaying source URL
- displaying last-checked date
- displaying relevant source notes/caveats
- reflecting `price_type`
- allowing sourced fields to be edited
- indicating user-edited sourced values
- preserving the existing Compare results layout and behavior
- preserving existing guest Compare behavior

The frontend should not recreate backend or decision-engine business logic.

---

# Set 6 MVP Constraints

Set 6 does not require:

- automated web scraping
- live pricing
- dynamic apartment inventory
- apartment availability tracking
- map search
- apartment recommendations
- reviews
- safety scoring
- AI extraction
- AI recommendations
- comprehensive Athens housing coverage
- additional decision categories
- automatic source refresh
- field-level source provenance
- a separate sourced-data database
- a separate sourced-data comparison engine
- a redesigned Financial Plan

The dataset is intentionally small.

The purpose of Set 6 is to test whether students find optional source-backed housing presets useful enough to justify expanding the feature.

---

# Set 6 Definition of Done

Set 6 is complete when a user can:

1. Open the existing Housing Comparison screen.
2. Continue using manual entry without interacting with sourced data.
3. Choose sourced data independently for Scenario A or Scenario B.
4. Browse separate On-campus and Off-campus groups.
5. Select one of the curated housing configurations.
6. See known sourced values populate the existing comparison form.
7. See unknown values remain blank/unknown.
8. See source name, source URL, and last-checked date.
9. Understand whether a published price is a term rate or starting price.
10. Edit populated sourced values.
11. Complete any required field the source did not provide.
12. Compare sourced and/or manually entered scenarios normally.
13. Save the comparison normally.
14. Select Scenario A or Scenario B for the Financial Plan normally.
15. See the existing Financial Plan and decision-impact behavior continue to work.

No additional feature work is required for Set 6 MVP completion.