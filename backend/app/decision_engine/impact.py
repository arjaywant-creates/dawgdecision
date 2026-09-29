from .calculations import analyze_scenario
from .models import (
    Scenario,
    CategoryDelta,
    CostDriver,
    DecisionImpactResult,
)


def _difference_if_known(
        selected_value: float | None,
        alternative_value: float | None,
) -> float | None:
    if selected_value is None or alternative_value is None:
        return None

    return selected_value - alternative_value


def _find_largest_cost_increase(
        category_deltas: list[CategoryDelta],
) -> CostDriver | None:
    increases = [
        delta
        for delta in category_deltas
        if delta.difference > 0
    ]

    if not increases:
        return None

    largest = max(
        increases,
        key=lambda delta: delta.difference,
    )

    return CostDriver(
        category=largest.category,
        difference=largest.difference,
    )


def _find_largest_cost_offset(
        category_deltas: list[CategoryDelta],
) -> CostDriver | None:
    offsets = [
        delta
        for delta in category_deltas
        if delta.difference < 0
    ]

    if not offsets:
        return None

    largest = min(
        offsets,
        key=lambda delta: delta.difference,
    )

    return CostDriver(
        category=largest.category,
        difference=largest.difference,
    )


def analyze_decision_impact(
        scenario_a: Scenario,
        scenario_b: Scenario,
        selected_scenario: str,
) -> DecisionImpactResult:
    if selected_scenario not in {"A", "B"}:
        raise ValueError(
            'selected_scenario must be either "A" or "B"'
        )

    if selected_scenario == "A":
        selected = scenario_a
        alternative = scenario_b
    else:
        selected = scenario_b
        alternative = scenario_a

    selected_result = analyze_scenario(selected)
    alternative_result = analyze_scenario(alternative)

    monthly_comparison_complete = (
            selected_result.recurring_costs_complete
            and alternative_result.recurring_costs_complete
    )

    term_comparison_complete = (
            selected_result.term_cost_complete
            and alternative_result.term_cost_complete
            and selected.contract_months
            == alternative.contract_months
    )

    commute_comparison_complete = (
            selected.commute_minutes is not None
            and alternative.commute_minutes is not None
    )

    if monthly_comparison_complete:
        monthly_commitment_delta = (
                selected_result.monthly_recurring_cost
                - alternative_result.monthly_recurring_cost
        )
    else:
        monthly_commitment_delta = None

    upfront_commitment_delta = _difference_if_known(
        selected.upfront_costs,
        alternative.upfront_costs,
    )

    if term_comparison_complete:
        term_commitment_delta = (
                selected_result.term_cost
                - alternative_result.term_cost
        )
    else:
        term_commitment_delta = None

    if commute_comparison_complete:
        commute_delta = (
                selected.commute_minutes
                - alternative.commute_minutes
        )
    else:
        commute_delta = None

    category_deltas = [
        CategoryDelta(
            category="housing",
            difference=(
                    selected_result.monthly_housing_cost
                    - alternative_result.monthly_housing_cost
            ),
        )
    ]

    optional_recurring_categories = {
        "utilities": (
            selected.utilities,
            alternative.utilities,
        ),
        "mandatory_fees": (
            selected.mandatory_fees,
            alternative.mandatory_fees,
        ),
        "parking": (
            selected.parking,
            alternative.parking,
        ),
        "transportation": (
            selected.transportation,
            alternative.transportation,
        ),
    }

    for category, values in optional_recurring_categories.items():
        selected_value, alternative_value = values

        difference = _difference_if_known(
            selected_value,
            alternative_value,
        )

        if difference is not None:
            category_deltas.append(
                CategoryDelta(
                    category=category,
                    difference=difference,
                )
            )

    largest_cost_increase = _find_largest_cost_increase(
        category_deltas
    )

    largest_cost_offset = _find_largest_cost_offset(
        category_deltas
    )

    break_even_months = None

    if (
            monthly_comparison_complete
            and upfront_commitment_delta is not None
            and upfront_commitment_delta > 0
            and monthly_commitment_delta is not None
            and monthly_commitment_delta < 0
    ):
        monthly_savings = -monthly_commitment_delta

        break_even_months = (
                upfront_commitment_delta / monthly_savings
        )

    extra_monthly_cost_for_shorter_commute = None
    commute_minutes_saved = None

    if (
            monthly_commitment_delta is not None
            and monthly_commitment_delta > 0
            and commute_delta is not None
            and commute_delta < 0
    ):
        extra_monthly_cost_for_shorter_commute = (
            monthly_commitment_delta
        )

        commute_minutes_saved = -commute_delta

    approximate_daily_delta = None

    if monthly_commitment_delta is not None:
        approximate_daily_delta = (
                monthly_commitment_delta / 30
        )

    return DecisionImpactResult(
        selected_scenario=selected.name,
        alternative_scenario=alternative.name,

        monthly_commitment_delta=monthly_commitment_delta,
        upfront_commitment_delta=upfront_commitment_delta,
        term_commitment_delta=term_commitment_delta,
        commute_delta=commute_delta,

        category_deltas=category_deltas,

        largest_cost_increase=largest_cost_increase,
        largest_cost_offset=largest_cost_offset,

        break_even_months=break_even_months,

        extra_monthly_cost_for_shorter_commute=(
            extra_monthly_cost_for_shorter_commute
        ),
        commute_minutes_saved=commute_minutes_saved,

        approximate_daily_delta=approximate_daily_delta,

        monthly_comparison_complete=monthly_comparison_complete,
        term_comparison_complete=term_comparison_complete,
        commute_comparison_complete=commute_comparison_complete,
    )