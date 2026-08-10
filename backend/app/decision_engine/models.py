from dataclasses import dataclass, field


@dataclass
class Scenario:
    name: str
    monthly_income: float
    rent: float
    utilities: float
    transportation: float
    mandatory_fees: float = 0.0
    other_expenses: float = 0.0
    lease_months: int = 12

    def __post_init__(self):
        financial_fields = {
            "monthly_income": self.monthly_income,
            "rent": self.rent,
            "utilities": self.utilities,
            "transportation": self.transportation,
            "mandatory_fees": self.mandatory_fees,
            "other_expenses": self.other_expenses,
        }

        for field_name, value in financial_fields.items():
            if value < 0:
                raise ValueError(f"{field_name} cannot be negative")

        if self.lease_months <= 0:
            raise ValueError("lease_months must be greater than 0")


@dataclass
class Plan:
    name: str
    scenarios: list[Scenario] = field(default_factory=list)


@dataclass
class DecisionResult:
    scenario_name: str
    monthly_expenses: float
    lease_expenses: float
    monthly_surplus: float
    lease_surplus: float


@dataclass
class ComparisonResult:
    first_result: DecisionResult
    second_result: DecisionResult
    lower_monthly_cost_scenario: str
    monthly_difference: float