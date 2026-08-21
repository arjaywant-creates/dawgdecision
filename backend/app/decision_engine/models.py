from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Scenario:
    name: str
    housing_cost: float
    cost_period_months: float
    contract_months: int

    utilities: Optional[float] = None
    mandatory_fees: Optional[float] = None
    parking: Optional[float] = None
    transportation: Optional[float] = None
    upfront_costs: Optional[float] = None
    commute_minutes: Optional[float] = None

    def __post_init__(self):
        if not self.name.strip():
            raise ValueError("name cannot be empty")

        if self.housing_cost < 0:
            raise ValueError("housing_cost cannot be negative")

        if self.cost_period_months <= 0:
            raise ValueError("cost_period_months must be greater than 0")

        if self.contract_months <= 0:
            raise ValueError("contract_months must be greater than 0")

        optional_financial_fields = {
            "utilities": self.utilities,
            "mandatory_fees": self.mandatory_fees,
            "parking": self.parking,
            "transportation": self.transportation,
            "upfront_costs": self.upfront_costs,
        }

        for field_name, value in optional_financial_fields.items():
            if value is not None and value < 0:
                raise ValueError(f"{field_name} cannot be negative")

        if self.commute_minutes is not None and self.commute_minutes < 0:
            raise ValueError("commute_minutes cannot be negative")


@dataclass
class Plan:
    name: str
    scenarios: list[Scenario] = field(default_factory=list)


@dataclass
class DecisionResult:
    scenario_name: str

    monthly_housing_cost: float
    monthly_recurring_cost: float
    term_cost: float
    upfront_costs: Optional[float]

    housing_cost: float
    utilities: Optional[float]
    mandatory_fees: Optional[float]
    parking: Optional[float]
    transportation: Optional[float]
    commute_minutes: Optional[float]

    missing_recurring_costs: list[str] = field(default_factory=list)
    recurring_costs_complete: bool = False
    term_cost_complete: bool = False


@dataclass
class Tradeoff:
    type: str
    favored_scenario: Optional[str]
    difference: float


@dataclass
class ComparisonResult:
    first_result: DecisionResult
    second_result: DecisionResult

    monthly_difference: float
    term_difference: Optional[float]

    housing_cost_difference: float
    utilities_difference: Optional[float]
    mandatory_fees_difference: Optional[float]
    parking_difference: Optional[float]
    transportation_difference: Optional[float]
    upfront_cost_difference: Optional[float]
    commute_difference: Optional[float]

    tradeoffs: list[Tradeoff] = field(default_factory=list)


@dataclass
class CategoryDelta:
    category: str
    difference: float


@dataclass
class CostDriver:
    category: str
    difference: float


@dataclass
class DecisionImpactResult:
    selected_scenario: str
    alternative_scenario: str

    monthly_commitment_delta: Optional[float]
    upfront_commitment_delta: Optional[float]
    term_commitment_delta: Optional[float]
    commute_delta: Optional[float]

    category_deltas: list[CategoryDelta] = field(default_factory=list)

    largest_cost_increase: Optional[CostDriver] = None
    largest_cost_offset: Optional[CostDriver] = None

    break_even_months: Optional[float] = None

    extra_monthly_cost_for_shorter_commute: Optional[float] = None
    commute_minutes_saved: Optional[float] = None

    approximate_daily_delta: Optional[float] = None

    monthly_comparison_complete: bool = False
    term_comparison_complete: bool = False
    commute_comparison_complete: bool = False