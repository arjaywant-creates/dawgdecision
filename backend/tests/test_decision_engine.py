import pytest

from app.decision_engine.models import Scenario
from app.decision_engine.calculations import analyze_scenario
from app.decision_engine.comparison import compare_scenarios


def make_complete_scenario(
        name="Apartment A",
        housing_cost=1000,
        cost_period_months=1,
        contract_months=12,
        utilities=100,
        mandatory_fees=50,
        parking=75,
        transportation=50,
        upfront_costs=500,
        commute_minutes=15,
):
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


def test_analyze_complete_monthly_scenario():
    scenario = make_complete_scenario()

    result = analyze_scenario(scenario)

    assert result.scenario_name == "Apartment A"
    assert result.monthly_housing_cost == 1000
    assert result.monthly_recurring_cost == 1275
    assert result.term_cost == 15800
    assert result.upfront_costs == 500
    assert result.recurring_costs_complete is True
    assert result.term_cost_complete is True


def test_housing_cost_is_normalized_by_cost_period():
    scenario = make_complete_scenario(
        housing_cost=4000,
        cost_period_months=4,
    )

    result = analyze_scenario(scenario)

    assert result.monthly_housing_cost == 1000
    assert result.monthly_recurring_cost == 1275


def test_upfront_cost_is_added_once():
    scenario = make_complete_scenario(
        housing_cost=1000,
        utilities=0,
        mandatory_fees=0,
        parking=0,
        transportation=0,
        upfront_costs=600,
        contract_months=12,
    )

    result = analyze_scenario(scenario)

    assert result.monthly_recurring_cost == 1000
    assert result.term_cost == 12600


def test_zero_is_different_from_unknown():
    zero_scenario = make_complete_scenario(
        utilities=0,
    )

    unknown_scenario = make_complete_scenario(
        utilities=None,
    )

    zero_result = analyze_scenario(zero_scenario)
    unknown_result = analyze_scenario(unknown_scenario)

    assert zero_result.utilities == 0
    assert "utilities" not in zero_result.missing_recurring_costs
    assert zero_result.recurring_costs_complete is True

    assert unknown_result.utilities is None
    assert "utilities" in unknown_result.missing_recurring_costs
    assert unknown_result.recurring_costs_complete is False


def test_missing_optional_recurring_cost_uses_known_subtotal():
    scenario = make_complete_scenario(
        utilities=None,
        parking=None,
    )

    result = analyze_scenario(scenario)

    # Known values:
    # housing 1000 + mandatory fees 50 + transportation 50
    assert result.monthly_recurring_cost == 1100

    assert set(result.missing_recurring_costs) == {
        "utilities",
        "parking",
    }

    assert result.recurring_costs_complete is False


def test_missing_upfront_cost_makes_term_cost_incomplete():
    scenario = make_complete_scenario(
        upfront_costs=None,
    )

    result = analyze_scenario(scenario)

    assert result.upfront_costs is None
    assert result.term_cost_complete is False


def test_compare_complete_scenarios():
    first = make_complete_scenario(
        name="Apartment A",
        housing_cost=900,
        utilities=100,
        mandatory_fees=50,
        parking=50,
        transportation=100,
        upfront_costs=600,
        commute_minutes=20,
    )

    second = make_complete_scenario(
        name="Apartment B",
        housing_cost=1000,
        utilities=75,
        mandatory_fees=25,
        parking=25,
        transportation=50,
        upfront_costs=300,
        commute_minutes=10,
    )

    result = compare_scenarios(first, second)

    # A monthly = 1200
    # B monthly = 1175
    assert result.first_result.monthly_recurring_cost == 1200
    assert result.second_result.monthly_recurring_cost == 1175
    assert result.monthly_difference == 25

    assert result.housing_cost_difference == 100
    assert result.utilities_difference == 25
    assert result.mandatory_fees_difference == 25
    assert result.parking_difference == 25
    assert result.transportation_difference == 50
    assert result.upfront_cost_difference == 300
    assert result.commute_difference == 10


def test_equal_monthly_costs_produce_no_monthly_tradeoff():
    first = make_complete_scenario(
        name="Apartment A",
        housing_cost=900,
        utilities=100,
        mandatory_fees=50,
        parking=50,
        transportation=100,
    )

    second = make_complete_scenario(
        name="Apartment B",
        housing_cost=1000,
        utilities=50,
        mandatory_fees=25,
        parking=25,
        transportation=100,
    )

    result = compare_scenarios(first, second)

    assert result.monthly_difference == 0

    monthly_tradeoffs = [
        tradeoff
        for tradeoff in result.tradeoffs
        if tradeoff.type == "lower_monthly_cost"
    ]

    assert monthly_tradeoffs == []


def test_lower_monthly_cost_tradeoff():
    first = make_complete_scenario(
        name="Apartment A",
        housing_cost=900,
    )

    second = make_complete_scenario(
        name="Apartment B",
        housing_cost=1000,
    )

    result = compare_scenarios(first, second)

    tradeoff = next(
        tradeoff
        for tradeoff in result.tradeoffs
        if tradeoff.type == "lower_monthly_cost"
    )

    assert tradeoff.favored_scenario == "Apartment A"
    assert tradeoff.difference == 100


def test_lower_upfront_cost_tradeoff():
    first = make_complete_scenario(
        name="Apartment A",
        upfront_costs=700,
    )

    second = make_complete_scenario(
        name="Apartment B",
        upfront_costs=300,
    )

    result = compare_scenarios(first, second)

    tradeoff = next(
        tradeoff
        for tradeoff in result.tradeoffs
        if tradeoff.type == "lower_upfront_cost"
    )

    assert tradeoff.favored_scenario == "Apartment B"
    assert tradeoff.difference == 400


def test_shorter_commute_tradeoff():
    first = make_complete_scenario(
        name="Apartment A",
        commute_minutes=25,
    )

    second = make_complete_scenario(
        name="Apartment B",
        commute_minutes=10,
    )

    result = compare_scenarios(first, second)

    tradeoff = next(
        tradeoff
        for tradeoff in result.tradeoffs
        if tradeoff.type == "shorter_commute"
    )

    assert tradeoff.favored_scenario == "Apartment B"
    assert tradeoff.difference == 15


def test_unknown_commute_produces_no_commute_difference_or_tradeoff():
    first = make_complete_scenario(
        name="Apartment A",
        commute_minutes=None,
    )

    second = make_complete_scenario(
        name="Apartment B",
        commute_minutes=10,
    )

    result = compare_scenarios(first, second)

    assert result.commute_difference is None

    commute_tradeoffs = [
        tradeoff
        for tradeoff in result.tradeoffs
        if tradeoff.type == "shorter_commute"
    ]

    assert commute_tradeoffs == []


def test_unknown_category_produces_no_category_difference():
    first = make_complete_scenario(
        utilities=None,
    )

    second = make_complete_scenario(
        utilities=100,
    )

    result = compare_scenarios(first, second)

    assert result.utilities_difference is None


def test_incomplete_monthly_cost_produces_no_monthly_tradeoff():
    first = make_complete_scenario(
        name="Apartment A",
        utilities=None,
    )

    second = make_complete_scenario(
        name="Apartment B",
        utilities=100,
    )

    result = compare_scenarios(first, second)

    monthly_tradeoffs = [
        tradeoff
        for tradeoff in result.tradeoffs
        if tradeoff.type == "lower_monthly_cost"
    ]

    assert monthly_tradeoffs == []


def test_equal_contract_lengths_allow_term_difference():
    first = make_complete_scenario(
        housing_cost=900,
        contract_months=12,
    )

    second = make_complete_scenario(
        housing_cost=1000,
        contract_months=12,
    )

    result = compare_scenarios(first, second)

    assert result.term_difference is not None
    assert result.term_difference == 1200


def test_different_contract_lengths_do_not_produce_term_difference():
    first = make_complete_scenario(
        contract_months=10,
    )

    second = make_complete_scenario(
        contract_months=12,
    )

    result = compare_scenarios(first, second)

    assert result.term_difference is None


def test_unknown_upfront_cost_prevents_term_difference():
    first = make_complete_scenario(
        upfront_costs=None,
    )

    second = make_complete_scenario(
        upfront_costs=500,
    )

    result = compare_scenarios(first, second)

    assert result.term_difference is None


@pytest.mark.parametrize(
    "field_name,value",
    [
        ("housing_cost", -1),
        ("utilities", -1),
        ("mandatory_fees", -1),
        ("parking", -1),
        ("transportation", -1),
        ("upfront_costs", -1),
        ("commute_minutes", -1),
    ],
)
def test_negative_values_are_rejected(field_name, value):
    kwargs = {
        "name": "Apartment",
        "housing_cost": 1000,
        "cost_period_months": 1,
        "contract_months": 12,
        "utilities": 100,
        "mandatory_fees": 50,
        "parking": 50,
        "transportation": 50,
        "upfront_costs": 500,
        "commute_minutes": 10,
    }

    kwargs[field_name] = value

    with pytest.raises(ValueError):
        Scenario(**kwargs)


def test_zero_or_negative_cost_period_is_rejected():
    with pytest.raises(ValueError):
        make_complete_scenario(
            cost_period_months=0,
        )

    with pytest.raises(ValueError):
        make_complete_scenario(
            cost_period_months=-1,
        )


def test_zero_or_negative_contract_length_is_rejected():
    with pytest.raises(ValueError):
        make_complete_scenario(
            contract_months=0,
        )

    with pytest.raises(ValueError):
        make_complete_scenario(
            contract_months=-1,
        )


def test_empty_name_is_rejected():
    with pytest.raises(ValueError):
        make_complete_scenario(
            name="   ",
        )