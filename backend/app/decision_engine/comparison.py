from .models import (
    Scenario,
    ComparisonResult,
    Tradeoff,
)
from .calculations import analyze_scenario


def _difference_if_known(
        first_value: float | None,
        second_value: float | None,
) -> float | None:
    if first_value is None or second_value is None:
        return None

    return abs(first_value - second_value)


def _favored_scenario(
        first_name: str,
        first_value: float,
        second_name: str,
        second_value: float,
) -> str | None:
    if first_value < second_value:
        return first_name

    if second_value < first_value:
        return second_name

    return None


def compare_scenarios(
        first_scenario: Scenario,
        second_scenario: Scenario,
) -> ComparisonResult:

    first_result = analyze_scenario(first_scenario)
    second_result = analyze_scenario(second_scenario)

    monthly_difference = abs(
        first_result.monthly_recurring_cost
        - second_result.monthly_recurring_cost
    )

    # Full-term totals are directly comparable only when
    # both recurring totals are complete and both contracts
    # cover the same duration.
    if (
            first_result.term_cost_complete
            and second_result.term_cost_complete
            and first_scenario.contract_months
            == second_scenario.contract_months
    ):
        term_difference = abs(
            first_result.term_cost
            - second_result.term_cost
        )
    else:
        term_difference = None

    utilities_difference = _difference_if_known(
        first_scenario.utilities,
        second_scenario.utilities,
    )

    mandatory_fees_difference = _difference_if_known(
        first_scenario.mandatory_fees,
        second_scenario.mandatory_fees,
    )

    parking_difference = _difference_if_known(
        first_scenario.parking,
        second_scenario.parking,
    )

    transportation_difference = _difference_if_known(
        first_scenario.transportation,
        second_scenario.transportation,
    )

    upfront_cost_difference = _difference_if_known(
        first_scenario.upfront_costs,
        second_scenario.upfront_costs,
    )

    commute_difference = _difference_if_known(
        first_scenario.commute_minutes,
        second_scenario.commute_minutes,
    )

    tradeoffs: list[Tradeoff] = []

    # Monthly-cost tradeoff:
    # only valid when both monthly totals are complete.
    if (
            first_result.recurring_costs_complete
            and second_result.recurring_costs_complete
    ):
        favored = _favored_scenario(
            first_result.scenario_name,
            first_result.monthly_recurring_cost,
            second_result.scenario_name,
            second_result.monthly_recurring_cost,
        )

        if favored is not None:
            tradeoffs.append(
                Tradeoff(
                    type="lower_monthly_cost",
                    favored_scenario=favored,
                    difference=monthly_difference,
                )
            )

    # Upfront-cost tradeoff:
    # only valid when both values are known.
    if (
            first_scenario.upfront_costs is not None
            and second_scenario.upfront_costs is not None
    ):
        favored = _favored_scenario(
            first_result.scenario_name,
            first_scenario.upfront_costs,
            second_result.scenario_name,
            second_scenario.upfront_costs,
        )

        if favored is not None:
            tradeoffs.append(
                Tradeoff(
                    type="lower_upfront_cost",
                    favored_scenario=favored,
                    difference=upfront_cost_difference,
                )
            )

    # Commute tradeoff:
    # only valid when both values are known.
    if (
            first_scenario.commute_minutes is not None
            and second_scenario.commute_minutes is not None
    ):
        favored = _favored_scenario(
            first_result.scenario_name,
            first_scenario.commute_minutes,
            second_result.scenario_name,
            second_scenario.commute_minutes,
        )

        if favored is not None:
            tradeoffs.append(
                Tradeoff(
                    type="shorter_commute",
                    favored_scenario=favored,
                    difference=commute_difference,
                )
            )

    return ComparisonResult(
        first_result=first_result,
        second_result=second_result,
        monthly_difference=monthly_difference,
        term_difference=term_difference,

        housing_cost_difference=abs(
            first_result.monthly_housing_cost
            - second_result.monthly_housing_cost
        ),
        utilities_difference=utilities_difference,
        mandatory_fees_difference=mandatory_fees_difference,
        parking_difference=parking_difference,
        transportation_difference=transportation_difference,
        upfront_cost_difference=upfront_cost_difference,
        commute_difference=commute_difference,

        tradeoffs=tradeoffs,
    )