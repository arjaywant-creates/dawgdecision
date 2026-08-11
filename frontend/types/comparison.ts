export interface HousingScenario {
  name: string;
  monthly_income: number;
  rent: number;
  utilities: number;
  transportation: number;
  mandatory_fees: number;
  other_expenses: number;
  lease_months: number;
}

export interface ComparisonRequest {
  scenario_a: HousingScenario;
  scenario_b: HousingScenario;
}

export interface DecisionResult {
  scenario_name: string;
  monthly_expenses: number;
  annual_expenses: number;
  monthly_surplus: number;
  annual_surplus: number;
}

export interface ComparisonResult {
  first_result: DecisionResult;
  second_result: DecisionResult;
  cheaper_scenario: string;
  monthly_difference: number;
  annual_difference: number;
}