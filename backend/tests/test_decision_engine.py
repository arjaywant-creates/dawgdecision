from backend.app.decision_engine.models import Scenario
from backend.app.decision_engine.calculations import analyze_scenario
from backend.app.decision_engine.comparison import compare_scenarios


def test_analyze_scenario():
    scenario = Scenario(
        name="Apartment A",
        monthly_income=1500,
        rent=900,
        utilities=100,
        transportation=150
    )

    result = analyze_scenario(scenario)

    assert result.monthly_expenses == 1150
    assert result.annual_expenses == 13800
    assert result.monthly_surplus == 350
    assert result.annual_surplus == 4200


def test_compare_scenarios():
    apartment_a = Scenario(
        name="Apartment A",
        monthly_income=1500,
        rent=900,
        utilities=100,
        transportation=150
    )

    apartment_b = Scenario(
        name="Apartment B",
        monthly_income=1500,
        rent=1050,
        utilities=80,
        transportation=50
    )

    result = compare_scenarios(apartment_a, apartment_b)

    assert result.cheaper_scenario == "Apartment A"
    assert result.monthly_difference == 30
    assert result.annual_difference == 360

def test_equal_cost_scenarios():
    apartment_a = Scenario(
        name="Apartment A",
        monthly_income=1500,
        rent=900,
        utilities=100,
        transportation=100
    )

    apartment_b = Scenario(
        name="Apartment B",
        monthly_income=1500,
        rent=950,
        utilities=50,
        transportation=100
    )

    result = compare_scenarios(apartment_a, apartment_b)

    assert result.monthly_difference == 0
    assert result.annual_difference == 0