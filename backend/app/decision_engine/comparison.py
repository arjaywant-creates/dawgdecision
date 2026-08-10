from .models import Scenario, ComparisonResult
from .calculations import analyze_scenario


def compare_scenarios(
        first_scenario: Scenario,
        second_scenario: Scenario
) -> ComparisonResult:

    first_result = analyze_scenario(first_scenario)
    second_result = analyze_scenario(second_scenario)

    if first_result.monthly_expenses < second_result.monthly_expenses:
        lower_monthly_cost_scenario = first_result.scenario_name

    elif second_result.monthly_expenses < first_result.monthly_expenses:
        lower_monthly_cost_scenario = second_result.scenario_name

    else:
        lower_monthly_cost_scenario = "Tie"

    monthly_difference = abs(
        first_result.monthly_expenses
        - second_result.monthly_expenses
    )

    return ComparisonResult(
        first_result=first_result,
        second_result=second_result,
        lower_monthly_cost_scenario=lower_monthly_cost_scenario,
        monthly_difference=monthly_difference,
    )