# Decision Engine

The DawgDecision decision engine performs deterministic housing-cost analysis and scenario comparison independently of the API, database, frontend, and AI layers.

## Current MVP Scope

The current MVP supports comparison of two housing options.

Each housing scenario contains a small set of required inputs and additional optional inputs that improve the depth of the comparison.

### Required Inputs

Each scenario requires:

- Housing name
- Housing cost
- Number of months covered by that housing cost
- Total contract or stay length in months

### Optional Inputs

Each scenario may also include:

- Utilities
- Mandatory recurring fees
- Parking
- Transportation
- Upfront or move-in costs
- Commute time in minutes

Optional values are not required to run a comparison.

A missing optional value is represented as unknown rather than assumed to be zero.

For example:

- `utilities = None` means the utility cost is unknown or was not provided.
- `utilities = 0` means the user explicitly indicated that the utility cost is zero.

This distinction is preserved throughout the decision engine so that missing information is not presented as a known zero-cost value.

## Housing Cost Normalization

Housing costs may represent different billing periods.

The engine normalizes housing cost into a monthly value using:

`monthly housing cost = housing cost / cost period months`

Examples:

- `$1,000` covering `1` month becomes `$1,000/month`.
- `$4,000` covering `4` months becomes `$1,000/month`.

This allows housing options with different billing structures to be compared using the same monthly basis.

## Scenario Analysis

For each scenario, the decision engine calculates:

- Normalized monthly housing cost
- Known monthly recurring cost
- Full-term cost
- Whether recurring-cost information is complete
- Whether full-term cost information is complete

### Monthly Recurring Cost

Monthly recurring cost is calculated from:

`monthly housing cost + utilities + mandatory fees + parking + transportation`

Known optional values are included in the calculation.

Unknown optional values are temporarily excluded from arithmetic while remaining marked as unknown.

Therefore, if one or more recurring-cost fields are missing, the numeric result represents the known recurring-cost subtotal rather than a confirmed complete total.

### Recurring-Cost Completeness

A monthly recurring-cost total is considered complete only when all of the following are known:

- Utilities
- Mandatory recurring fees
- Parking
- Transportation

An explicit value of `0` counts as known.

A value of `None` counts as unknown.

### Full-Term Cost

Full-term cost is calculated as:

`monthly recurring cost × contract months + upfront costs`

Upfront or move-in costs are added only once.

A full-term cost is considered complete only when:

- All recurring-cost fields are known, and
- Upfront or move-in costs are known

An unknown upfront cost is not assumed to be zero.

## Scenario Comparison

Two housing scenarios can be compared using their normalized costs and other supplied information.

The comparison returns:

- Analysis results for both scenarios
- Monthly cost difference
- Full-term difference when directly comparable
- Housing-cost difference
- Utilities difference
- Mandatory-fee difference
- Parking difference
- Transportation difference
- Upfront-cost difference
- Commute-time difference
- Supported objective tradeoffs

### Category Differences

A category difference is calculated only when both scenarios provide a known value for that category.

For example:

- If both scenarios provide utilities, the utilities difference is calculated.
- If either scenario has unknown utilities, the utilities difference is returned as unknown.

This prevents missing information from being interpreted as zero.

### Monthly Cost Comparison

A numeric monthly difference can be calculated from the currently known recurring-cost values.

However, a lower-monthly-cost tradeoff is generated only when both scenarios have complete recurring-cost information.

This prevents DawgDecision from claiming that one option is definitively cheaper when important monthly costs remain unknown.

### Full-Term Comparison

A direct full-term difference is returned only when:

- Both scenarios have complete full-term cost information, and
- Both scenarios cover the same number of contract months

If contract lengths differ, the engine does not present the difference between the two full-term totals as direct savings because the totals cover different periods.

The individual term costs may still be displayed with their respective durations.

## Key Tradeoffs

The MVP decision engine supports a small set of deterministic tradeoffs.

### Lower Monthly Cost

Generated only when:

- Both scenarios have complete recurring-cost information, and
- Their monthly recurring costs differ

The tradeoff identifies the lower-cost scenario and the monthly difference.

### Lower Upfront Cost

Generated only when:

- Both scenarios have known upfront or move-in costs, and
- The values differ

The tradeoff identifies the scenario requiring less upfront cash and the difference.

### Shorter Commute

Generated only when:

- Both scenarios have known commute times, and
- The commute times differ

The tradeoff identifies the scenario with the shorter commute and the difference in minutes.

### Ties

If the values for a supported tradeoff are equal, no favored scenario is generated for that tradeoff.

## Recommendation Policy

The decision engine does not determine that one housing option is universally better.

It does not generate:

- Overall scores
- Subjective rankings
- Preference weighting
- "Option A is better" recommendations
- Black-box recommendations

Instead, it reports objective differences and supported tradeoffs so the student can make the final decision.

## Removed Housing-Comparison Concepts

The Housing v1 model no longer includes:

- Monthly income
- Monthly surplus
- Lease-period surplus
- Generic other expenses

Affordability and funding are separate questions from housing-option comparison and may be handled later through the Financial Plan.

## Input Validation

The decision engine rejects invalid scenario data, including:

- Empty housing names
- Negative housing costs
- Zero or negative cost periods
- Zero or negative contract lengths
- Negative optional financial values
- Negative commute times

Optional fields may be omitted.

Explicit zero values remain valid.

## Architecture Principle

The decision engine contains the application's core housing-comparison business logic.

It does not depend on:

- FastAPI
- PostgreSQL
- Prisma
- React
- Next.js
- AWS
- Authentication
- AI services

The API layer should expose the decision engine's behavior rather than reproduce its calculations.

This separation keeps the financial logic:

- Deterministic
- Testable
- Reusable
- Independent of presentation and infrastructure

## Current Test Coverage

The Housing v1 decision engine includes automated tests covering:

- Monthly housing-cost normalization
- Monthly recurring-cost calculations
- Full-term calculations
- Upfront-cost handling
- Explicit zero versus unknown values
- Missing recurring-cost fields
- Category differences
- Monthly-cost tradeoffs
- Upfront-cost tradeoffs
- Commute tradeoffs
- Tie behavior
- Missing commute data
- Different contract lengths
- Incomplete term costs
- Negative-value validation
- Empty housing names
- Invalid cost periods
- Invalid contract lengths

## Future Expansion

Future versions may add:

- Source-backed housing data
- Automatic or suggested assumptions
- Additional housing cost categories where justified by user research
- Consolidated Financial Plans
- Additional decision categories
- Additional objective tradeoffs
- Source and freshness metadata
- More advanced financial calculations
- Optional AI-generated explanations of deterministic decision-engine results