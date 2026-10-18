import json
from pathlib import Path
import pytest

from app.decision_engine.models import Scenario
from app.decision_engine.calculations import analyze_scenario
from app.decision_engine.comparison import compare_scenarios
from app.decision_engine.impact import analyze_decision_impact


@pytest.fixture
def housing_sources():
    data_path = Path(__file__).resolve().parent.parent.parent / "data" / "housing_sources.json"
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {o["id"]: o for o in data["housing_options"]}


def test_scenario1_dorm_vs_luxury_apartment(housing_sources):
    """
    Scenario 1: Brumby Hall ($3,595/term, 4 mo, 8 mo stay) vs
    The Standard at Athens ($1,205/mo, 1 mo, 12 mo stay).
    Verifies that:
    1. Monthly housing cost is normalized: $898.75/mo vs $1,205.00/mo.
    2. Lower housing cost tradeoff is emitted, favoring Brumby Hall by $306.25.
    3. Direct term difference is None because contract lengths differ (8 vs 12).
    """
    brumby = housing_sources["brumby_hall_double_with_community_bath"]
    standard = housing_sources["the_standard_at_athens_4_bed_4_bath"]

    sc_a = Scenario(
        name=f"{brumby['property_name']} - {brumby['configuration']}",
        housing_cost=brumby["housing_cost"],
        cost_period_months=brumby["cost_period_months"],
        contract_months=brumby["contract_months"],
        utilities=brumby["utilities"],
        mandatory_fees=brumby["mandatory_fees"],
        parking=brumby["parking"],
        transportation=brumby["transportation"],
        upfront_costs=brumby["upfront_costs"],
        commute_minutes=brumby["commute_minutes"],
    )

    sc_b = Scenario(
        name=f"{standard['property_name']} - {standard['configuration']}",
        housing_cost=standard["housing_cost"],
        cost_period_months=standard["cost_period_months"],
        contract_months=standard["contract_months"],
        utilities=standard["utilities"],
        mandatory_fees=standard["mandatory_fees"],
        parking=standard["parking"],
        transportation=standard["transportation"],
        upfront_costs=standard["upfront_costs"],
        commute_minutes=standard["commute_minutes"],
    )

    res_a = analyze_scenario(sc_a)
    res_b = analyze_scenario(sc_b)

    assert res_a.monthly_housing_cost == 3595.0 / 4  # 898.75
    assert res_b.monthly_housing_cost == 1205.0 / 1  # 1205.00

    comp = compare_scenarios(sc_a, sc_b)

    # Term difference must be None due to differing contract lengths (8 vs 12)
    assert comp.term_difference is None

    # Lower housing cost tradeoff MUST be emitted
    housing_tradeoffs = [t for t in comp.tradeoffs if t.type == "lower_housing_cost"]
    assert len(housing_tradeoffs) == 1
    assert housing_tradeoffs[0].favored_scenario == sc_a.name
    assert housing_tradeoffs[0].difference == pytest.approx(306.25)


def test_scenario2_ecv_apartment_vs_dorm_durations(housing_sources):
    """
    Scenario 2: Busbee Hall (11-mo contract, $4,436/term) vs Creswell Hall (8-mo contract, $3,492/term).
    Verifies that differing stay lengths are handled safely without false comparisons.
    """
    busbee = housing_sources["busbee_hall_4_bedrooms_2_baths"]
    creswell = housing_sources["creswell_hall_double_with_community_bath"]

    sc_a = Scenario(
        name=f"{busbee['property_name']} - {busbee['configuration']}",
        housing_cost=busbee["housing_cost"],
        cost_period_months=busbee["cost_period_months"],
        contract_months=busbee["contract_months"],
    )
    sc_b = Scenario(
        name=f"{creswell['property_name']} - {creswell['configuration']}",
        housing_cost=creswell["housing_cost"],
        cost_period_months=creswell["cost_period_months"],
        contract_months=creswell["contract_months"],
    )

    res_a = analyze_scenario(sc_a)
    res_b = analyze_scenario(sc_b)

    assert res_a.term_cost == (4436.0 / 4) * 11  # 12,199.00
    assert res_b.term_cost == (3492.0 / 4) * 8   # 6,984.00

    comp = compare_scenarios(sc_a, sc_b)
    assert comp.term_difference is None

    housing_tradeoffs = [t for t in comp.tradeoffs if t.type == "lower_housing_cost"]
    assert len(housing_tradeoffs) == 1
    assert housing_tradeoffs[0].favored_scenario == sc_b.name


def test_scenario5_room_variants_same_property_tradeoffs(housing_sources):
    """
    Scenario 5: Building 1516 Double ($4,419/term) vs Single ($4,706/term).
    Verifies that comparing room variants in the same residence hall emits a lower housing cost tradeoff.
    """
    double_opt = housing_sources["building_1516_double_with_bath"]
    single_opt = housing_sources["building_1516_single_with_bath"]

    sc_a = Scenario(
        name=f"{double_opt['property_name']} - {double_opt['configuration']}",
        housing_cost=double_opt["housing_cost"],
        cost_period_months=double_opt["cost_period_months"],
        contract_months=double_opt["contract_months"],
    )
    sc_b = Scenario(
        name=f"{single_opt['property_name']} - {single_opt['configuration']}",
        housing_cost=single_opt["housing_cost"],
        cost_period_months=single_opt["cost_period_months"],
        contract_months=single_opt["contract_months"],
    )

    comp = compare_scenarios(sc_a, sc_b)

    housing_tradeoffs = [t for t in comp.tradeoffs if t.type == "lower_housing_cost"]
    assert len(housing_tradeoffs) == 1
    assert housing_tradeoffs[0].favored_scenario == sc_a.name
    assert housing_tradeoffs[0].difference == pytest.approx(71.75)


def test_lower_full_term_cost_tradeoff_for_complete_options():
    """
    Verifies that when both scenarios have verified complete costs and equal contract duration,
    both lower_monthly_cost and lower_full_term_cost tradeoffs are emitted.
    """
    sc_a = Scenario(
        name="Option A",
        housing_cost=1000,
        cost_period_months=1,
        contract_months=12,
        utilities=50,
        mandatory_fees=20,
        parking=0,
        transportation=0,
        upfront_costs=100,
    )
    sc_b = Scenario(
        name="Option B",
        housing_cost=1200,
        cost_period_months=1,
        contract_months=12,
        utilities=50,
        mandatory_fees=20,
        parking=0,
        transportation=0,
        upfront_costs=200,
    )

    comp = compare_scenarios(sc_a, sc_b)

    tradeoff_types = [t.type for t in comp.tradeoffs]
    assert "lower_monthly_cost" in tradeoff_types
    assert "lower_housing_cost" in tradeoff_types
    assert "lower_full_term_cost" in tradeoff_types

    term_tradeoff = next(t for t in comp.tradeoffs if t.type == "lower_full_term_cost")
    assert term_tradeoff.favored_scenario == "Option A"
    assert term_tradeoff.difference == (1200 * 12 + 70 * 12 + 200) - (1000 * 12 + 70 * 12 + 100)
