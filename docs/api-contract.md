# API Contract

## Purpose

This document defines the MVP API contract between the React/Next.js frontend, FastAPI backend, persistence layer, and DawgDecision decision engine.

The contract reflects the Housing v1 comparison model used in Deliverable Set 4.

The decision engine remains the source of truth for all housing-comparison calculations and tradeoff logic.

The FastAPI layer should expose that behavior rather than reimplement it.

---

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

1. Receiving request data.
2. Validating request structure.
3. Converting request data into decision-engine models.
4. Calling the decision engine.
5. Returning structured results to the frontend.
6. Enforcing authentication and ownership where persistence is involved.

The FastAPI layer should not duplicate financial calculations or tradeoff logic already implemented in the decision engine.

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
