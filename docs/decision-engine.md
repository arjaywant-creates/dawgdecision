# Decision Engine

The DawgDecision decision engine performs deterministic financial calculations and scenario comparisons independently of the API, database, frontend, and AI layers.

## Current MVP Scope

The initial implementation supports housing-related scenario analysis.

Each scenario includes:

- Scenario name
- Monthly income
- Rent
- Utilities
- Transportation cost
- Mandatory or recurring fees
- Other monthly expenses
- Lease duration in months

## Scenario Analysis

For each scenario, the decision engine calculates:

- Total monthly expenses
- Total lease-period expenses
- Monthly surplus
- Lease-period surplus

Monthly expenses are calculated as:

`rent + utilities + transportation + mandatory fees + other monthly expenses`

Lease-period expenses are calculated as:

`monthly expenses × lease duration`

Monthly surplus is calculated as:

`monthly income - monthly expenses`

Lease-period surplus is calculated as:

`monthly surplus × lease duration`

## Scenario Comparison

Two scenarios can currently be compared based on monthly financial cost.

The comparison returns:

- Analysis results for both scenarios
- Lower monthly-cost scenario
- Monthly cost difference

Each scenario also includes its own total lease-period cost so that students can understand the full financial commitment of each housing option.

The engine does not determine which option is universally better. It reports objective financial differences so the student can evaluate those differences alongside non-financial factors such as commute, time, academics, stress, and personal preferences.

## Input Validation

The decision engine rejects invalid scenario data, including:

- Negative financial values
- Lease durations of zero or fewer months

This prevents impossible or invalid financial scenarios from being processed.

## Architecture Principle

The decision engine contains the application's core financial logic.

It does not depend on:

- FastAPI
- PostgreSQL
- React
- AWS
- AI services

This separation keeps the financial logic deterministic, testable, and reusable.

## Future Expansion

Future versions may add:

- Consolidated financial plans
- Multiple decision categories
- Source-backed housing data
- Adjustable assumptions
- Goal-based comparisons
- More advanced financial calculations
- Optional AI-generated explanations of decision-engine results
- Optional recommendation or tradeoff scoring where appropriate