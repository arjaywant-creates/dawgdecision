from dataclasses import dataclass, field


@dataclass
class Scenario:
    name: str
    monthly_income: float
    rent: float
    utilities: float
    transportation: float
    other_expenses: float = 0.0

@dataclass
class Plan:
    name: str
    scenarios: list[Scenario] = field(default_factory=list)

@dataclass
class DecisionResult:
    scenario_name: str
    monthly_expenses: float
    annual_expenses: float
    monthly_surplus: float
    annual_surplus: float


@dataclass
class ComparisonResult:
    first_result: DecisionResult
    second_result: DecisionResult
    cheaper_scenario: str
    monthly_difference: float
    annual_difference: float