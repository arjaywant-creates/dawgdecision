# API Contract

## Purpose

This document defines the current MVP API contract between the React/Next.js frontend, FastAPI backend, and DawgDecision decision engine.

The contract reflects the current Week 2 housing-comparison architecture and may evolve as additional decision categories and consolidated-plan functionality are added.

## Base Behavior

The FastAPI layer is responsible for:

1. Receiving and validating request data.
2. Converting request data into decision-engine models.
3. Calling the decision engine.
4. Returning structured results to the frontend.

The FastAPI layer should not duplicate the financial calculations performed by the decision engine.

---

## Analyze One Scenario

### Endpoint

`POST /api/analyze`

### Purpose

Analyzes one housing scenario and returns its calculated financial results.

### Request

```json
{
  "name": "Apartment A",
  "monthly_income": 1500,
  "rent": 900,
  "utilities": 100,
  "transportation": 150,
  "mandatory_fees": 50,
  "other_expenses": 0,
  "lease_months": 12
}