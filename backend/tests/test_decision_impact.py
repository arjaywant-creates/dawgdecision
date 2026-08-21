import pytest

from app.decision_engine.impact import analyze_decision_impact
from app.decision_engine.models import Scenario


def make_scenario(
        name: str = "Apartment A",
        housing_cost: float = 1000,
        cost_period_months: float = 1,
        contract_months: int = 12,
        utilities: float | None = 100,
        mandatory_fees: float | None = 50,
        parking: float | None = 50,
        transportation: float | None = 50,
        upfront_costs: float | None = 500,
        commute_minutes: float | None = 15,
) -> Scenario:
    return Scenario(
        name=name,
        housing_cost=housing_cost,
        cost_period_months=cost_period_months,
        contract_months=contract_months,
        utilities=utilities,
        mandatory_fees=mandatory_fees,
        parking=parking,
        transportation=transportation,
        upfront_costs=upfront_costs,
        commute_minutes=commute_minutes,
    )


def test_selected_b_more_expensive_monthly():
    a = make_scenario(
        name="Apartment A",
        housing_cost=900,
    )

    b = make_scenario(
        name="Apartment B",
        housing_cost=1000,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.selected_scenario == "Apartment B"
    assert result.alternative_scenario == "Apartment A"
    assert result.monthly_commitment_delta == 100
    assert result.approximate_daily_delta == pytest.approx(100 / 30)


def test_selected_b_cheaper_monthly():
    a = make_scenario(
        name="Apartment A",
        housing_cost=1100,
    )

    b = make_scenario(
        name="Apartment B",
        housing_cost=1000,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.monthly_commitment_delta == -100
    assert result.approximate_daily_delta == pytest.approx(-100 / 30)


def test_upfront_commitment_delta():
    a = make_scenario(
        name="Apartment A",
        upfront_costs=300,
    )

    b = make_scenario(
        name="Apartment B",
        upfront_costs=700,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.upfront_commitment_delta == 400


def test_term_commitment_delta_for_equal_contracts():
    a = make_scenario(
        name="Apartment A",
        housing_cost=900,
        contract_months=12,
    )

    b = make_scenario(
        name="Apartment B",
        housing_cost=1000,
        contract_months=12,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.term_comparison_complete is True
    assert result.term_commitment_delta == 1200


def test_term_commitment_delta_is_none_for_unequal_contracts():
    a = make_scenario(
        name="Apartment A",
        contract_months=10,
    )

    b = make_scenario(
        name="Apartment B",
        contract_months=12,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.term_comparison_complete is False
    assert result.term_commitment_delta is None


def test_commute_delta():
    a = make_scenario(
        name="Apartment A",
        commute_minutes=25,
    )

    b = make_scenario(
        name="Apartment B",
        commute_minutes=10,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.commute_comparison_complete is True
    assert result.commute_delta == -15


def test_unknown_commute():
    a = make_scenario(
        commute_minutes=None,
    )

    b = make_scenario(
        commute_minutes=10,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.commute_comparison_complete is False
    assert result.commute_delta is None
    assert result.commute_minutes_saved is None


def test_category_deltas():
    a = make_scenario(
        housing_cost=900,
        utilities=100,
        mandatory_fees=50,
        parking=75,
        transportation=150,
    )

    b = make_scenario(
        housing_cost=1050,
        utilities=125,
        mandatory_fees=25,
        parking=25,
        transportation=75,
    )

    result = analyze_decision_impact(a, b, "B")

    deltas = {
        delta.category: delta.difference
        for delta in result.category_deltas
    }

    assert deltas["housing"] == 150
    assert deltas["utilities"] == 25
    assert deltas["mandatory_fees"] == -25
    assert deltas["parking"] == -50
    assert deltas["transportation"] == -75


def test_unknown_category_is_not_included():
    a = make_scenario(
        utilities=None,
    )

    b = make_scenario(
        utilities=100,
    )

    result = analyze_decision_impact(a, b, "B")

    categories = [
        delta.category
        for delta in result.category_deltas
    ]

    assert "utilities" not in categories


def test_largest_cost_increase():
    a = make_scenario(
        housing_cost=900,
        utilities=100,
        parking=100,
        transportation=100,
    )

    b = make_scenario(
        housing_cost=1100,
        utilities=125,
        parking=50,
        transportation=50,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.largest_cost_increase is not None
    assert result.largest_cost_increase.category == "housing"
    assert result.largest_cost_increase.difference == 200


def test_largest_cost_offset():
    a = make_scenario(
        housing_cost=900,
        utilities=100,
        parking=100,
        transportation=200,
    )

    b = make_scenario(
        housing_cost=1000,
        utilities=100,
        parking=75,
        transportation=50,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.largest_cost_offset is not None
    assert result.largest_cost_offset.category == "transportation"
    assert result.largest_cost_offset.difference == -150


def test_no_cost_increase_when_all_deltas_nonpositive():
    a = make_scenario(
        housing_cost=1100,
        utilities=125,
        parking=100,
        transportation=100,
    )

    b = make_scenario(
        housing_cost=1000,
        utilities=100,
        parking=75,
        transportation=50,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.largest_cost_increase is None


def test_no_cost_offset_when_all_deltas_nonnegative():
    a = make_scenario(
        housing_cost=900,
        utilities=100,
        parking=50,
        transportation=50,
    )

    b = make_scenario(
        housing_cost=1000,
        utilities=125,
        parking=75,
        transportation=100,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.largest_cost_offset is None


def test_break_even_when_selected_costs_more_upfront_but_less_monthly():
    a = make_scenario(
        housing_cost=1100,
        utilities=0,
        mandatory_fees=0,
        parking=0,
        transportation=0,
        upfront_costs=300,
    )

    b = make_scenario(
        housing_cost=1000,
        utilities=0,
        mandatory_fees=0,
        parking=0,
        transportation=0,
        upfront_costs=900,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.monthly_commitment_delta == -100
    assert result.upfront_commitment_delta == 600
    assert result.break_even_months == 6


def test_no_break_even_when_selected_costs_more_monthly():
    a = make_scenario(
        housing_cost=900,
        upfront_costs=300,
    )

    b = make_scenario(
        housing_cost=1000,
        upfront_costs=900,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.break_even_months is None


def test_no_break_even_when_upfront_cost_unknown():
    a = make_scenario(
        housing_cost=1100,
        upfront_costs=None,
    )

    b = make_scenario(
        housing_cost=1000,
        upfront_costs=900,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.break_even_months is None


def test_more_expensive_selected_option_with_shorter_commute():
    a = make_scenario(
        housing_cost=900,
        commute_minutes=25,
    )

    b = make_scenario(
        housing_cost=1000,
        commute_minutes=10,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.extra_monthly_cost_for_shorter_commute == 100
    assert result.commute_minutes_saved == 15


def test_cheaper_selected_option_with_shorter_commute_does_not_create_premium():
    a = make_scenario(
        housing_cost=1100,
        commute_minutes=25,
    )

    b = make_scenario(
        housing_cost=1000,
        commute_minutes=10,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.monthly_commitment_delta == -100
    assert result.commute_delta == -15
    assert result.extra_monthly_cost_for_shorter_commute is None
    assert result.commute_minutes_saved is None


def test_incomplete_monthly_cost_prevents_monthly_commitment_delta():
    a = make_scenario(
        utilities=None,
    )

    b = make_scenario(
        utilities=100,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.monthly_comparison_complete is False
    assert result.monthly_commitment_delta is None
    assert result.approximate_daily_delta is None


def test_incomplete_term_cost_prevents_term_commitment_delta():
    a = make_scenario(
        upfront_costs=None,
    )

    b = make_scenario(
        upfront_costs=500,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.term_comparison_complete is False
    assert result.term_commitment_delta is None


def test_zero_is_treated_as_known():
    a = make_scenario(
        utilities=0,
        mandatory_fees=0,
        parking=0,
        transportation=0,
        upfront_costs=0,
    )

    b = make_scenario(
        utilities=0,
        mandatory_fees=0,
        parking=0,
        transportation=0,
        upfront_costs=0,
    )

    result = analyze_decision_impact(a, b, "B")

    assert result.monthly_comparison_complete is True
    assert result.term_comparison_complete is True


def test_selected_a_uses_a_as_selected_scenario():
    a = make_scenario(
        name="Apartment A",
        housing_cost=900,
    )

    b = make_scenario(
        name="Apartment B",
        housing_cost=1000,
    )

    result = analyze_decision_impact(a, b, "A")

    assert result.selected_scenario == "Apartment A"
    assert result.alternative_scenario == "Apartment B"
    assert result.monthly_commitment_delta == -100


def test_invalid_selected_scenario_is_rejected():
    a = make_scenario()
    b = make_scenario(name="Apartment B")

    with pytest.raises(ValueError):
        analyze_decision_impact(a, b, "C")