from backend.app.decision_engine.models import Scenario
from backend.app.decision_engine.calculations import analyze_scenario
from backend.app.decision_engine.comparison import compare_scenarios


def test_analyze_scenario():
    scenario = Scenario(
        name="Apartment A",
        monthly_income=2000,
        rent=900,
        utilities=100,
        transportation=150,
        mandatory_fees=50,
        other_expenses=100,
        lease_months=12,
    )

    result = analyze_scenario(scenario)

    assert result.scenario_name == "Apartment A"
    assert result.monthly_expenses == 1300
    assert result.lease_expenses == 15600
    assert result.monthly_surplus == 700
    assert result.lease_surplus == 8400


def test_compare_scenarios():
    first = Scenario(
        name="Apartment A",
        monthly_income=2000,
        rent=900,
        utilities=100,
        transportation=150,
        mandatory_fees=50,
        lease_months=12,
    )

    second = Scenario(
        name="Apartment B",
        monthly_income=2000,
        rent=1050,
        utilities=75,
        transportation=50,
        mandatory_fees=25,
        lease_months=12,
    )

    result = compare_scenarios(first, second)

    assert result.first_result.monthly_expenses == 1200
    assert result.second_result.monthly_expenses == 1200
    assert result.lower_monthly_cost_scenario == "Tie"
    assert result.monthly_difference == 0


def test_lower_monthly_cost_scenario():
    first = Scenario(
        name="Far Apartment",
        monthly_income=2000,
        rent=800,
        utilities=100,
        transportation=200,
        lease_months=12,
    )

    second = Scenario(
        name="Near Apartment",
        monthly_income=2000,
        rent=1000,
        utilities=100,
        transportation=50,
        lease_months=12,
    )

    result = compare_scenarios(first, second)

    assert result.lower_monthly_cost_scenario == "Far Apartment"
    assert result.monthly_difference == 50


def test_mandatory_fees_are_included():
    scenario = Scenario(
        name="Apartment",
        monthly_income=2000,
        rent=900,
        utilities=100,
        transportation=100,
        mandatory_fees=200,
        lease_months=12,
    )

    result = analyze_scenario(scenario)

    assert result.monthly_expenses == 1300


def test_lease_duration_affects_total_cost():
    scenario = Scenario(
        name="Ten Month Lease",
        monthly_income=2000,
        rent=1000,
        utilities=100,
        transportation=100,
        lease_months=10,
    )

    result = analyze_scenario(scenario)

    assert result.monthly_expenses == 1200
    assert result.lease_expenses == 12000


def test_negative_monthly_surplus():
    scenario = Scenario(
        name="Expensive Apartment",
        monthly_income=1000,
        rent=1200,
        utilities=150,
        transportation=100,
        lease_months=12,
    )

    result = analyze_scenario(scenario)

    assert result.monthly_expenses == 1450
    assert result.monthly_surplus == -450
    assert result.lease_surplus == -5400