from .models import Scenario, ComparisonResult
from .calculations import analyze_scenario


def compare_scenarios(
        first_scenario: Scenario,
        second_scenario: Scenario
) -> ComparisonResult:
    first_result = analyze_scenario(first_scenario)
    second_result = analyze_scenario(second_scenario)

    if first_result.monthly_expenses <= second_result.monthly_expenses:
        cheaper_scenario = first_result.scenario_name
    else:
        cheaper_scenario = second_result.scenario_name

    monthly_difference = abs(
        first_result.monthly_expenses - second_result.monthly_expenses
    )

    annual_difference = monthly_difference * 12

    return ComparisonResult(
        first_result=first_result,
        second_result=second_result,
        cheaper_scenario=cheaper_scenario,
        monthly_difference=monthly_difference,
        annual_difference=annual_difference,
    )