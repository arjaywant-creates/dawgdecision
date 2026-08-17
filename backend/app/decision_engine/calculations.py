from .models import Scenario, DecisionResult


def _known_or_zero(value: float | None) -> float:
    return 0.0 if value is None else value


def analyze_scenario(scenario: Scenario) -> DecisionResult:
    monthly_housing_cost = (
            scenario.housing_cost / scenario.cost_period_months
    )

    recurring_fields = {
        "utilities": scenario.utilities,
        "mandatory_fees": scenario.mandatory_fees,
        "parking": scenario.parking,
        "transportation": scenario.transportation,
    }

    missing_recurring_costs = [
        field_name
        for field_name, value in recurring_fields.items()
        if value is None
    ]

    monthly_recurring_cost = (
            monthly_housing_cost
            + sum(_known_or_zero(value) for value in recurring_fields.values())
    )

    recurring_term_cost = (
            monthly_recurring_cost * scenario.contract_months
    )

    term_cost = (
            recurring_term_cost
            + _known_or_zero(scenario.upfront_costs)
    )

    return DecisionResult(
        scenario_name=scenario.name,
        monthly_housing_cost=monthly_housing_cost,
        monthly_recurring_cost=monthly_recurring_cost,
        term_cost=term_cost,
        upfront_costs=scenario.upfront_costs,
        housing_cost=scenario.housing_cost,
        utilities=scenario.utilities,
        mandatory_fees=scenario.mandatory_fees,
        parking=scenario.parking,
        transportation=scenario.transportation,
        commute_minutes=scenario.commute_minutes,
        missing_recurring_costs=missing_recurring_costs,
    )