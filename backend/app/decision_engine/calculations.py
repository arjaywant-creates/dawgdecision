from .models import Scenario, DecisionResult


def analyze_scenario(scenario: Scenario) -> DecisionResult:
    monthly_expenses = (
            scenario.rent
            + scenario.utilities
            + scenario.transportation
            + scenario.mandatory_fees
            + scenario.other_expenses
    )

    lease_expenses = monthly_expenses * scenario.lease_months
    monthly_surplus = scenario.monthly_income - monthly_expenses
    lease_surplus = monthly_surplus * scenario.lease_months

    return DecisionResult(
        scenario_name=scenario.name,
        monthly_expenses=monthly_expenses,
        lease_expenses=lease_expenses,
        monthly_surplus=monthly_surplus,
        lease_surplus=lease_surplus,
    )
