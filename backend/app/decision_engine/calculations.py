from .models import Scenario, DecisionResult


def analyze_scenario(scenario: Scenario) -> DecisionResult:
    monthly_expenses = (
            scenario.rent
            + scenario.utilities
            + scenario.transportation
            + scenario.other_expenses
    )

    annual_expenses = monthly_expenses * 12
    monthly_surplus = scenario.monthly_income - monthly_expenses
    annual_surplus = monthly_surplus * 12

    return DecisionResult(
        scenario_name=scenario.name,
        monthly_expenses=monthly_expenses,
        annual_expenses=annual_expenses,
        monthly_surplus=monthly_surplus,
        annual_surplus=annual_surplus,
    )