# Decision Engine

The DawgDecision decision engine performs deterministic financial calculations and scenario comparisons independently of the API, database, frontend, and AI layers.

## Current MVP Scope

The initial implementation supports basic housing-related scenario analysis.

Each scenario currently includes:

- Scenario name
- Monthly income
- Rent
- Utilities
- Transportation cost
- Other monthly expenses

## Scenario Analysis

For each scenario, the decision engine calculates:

- Total monthly expenses
- Total annual expenses
- Monthly surplus
- Annual surplus

Monthly surplus is calculated as:

`monthly income - monthly expenses`

## Scenario Comparison

Two scenarios can currently be compared based on total financial cost.

The comparison returns:

- Analysis results for both scenarios
- Lower-cost scenario
- Monthly cost difference
- Annual cost difference

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
- Recommendation scoring
- Goal-based comparisons
- More advanced financial calculations
- Optional AI-generated explanations of decision-engine results