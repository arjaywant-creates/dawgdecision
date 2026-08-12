export interface Scenario {
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
  scenario_a: Scenario;
  scenario_b: Scenario;
}

export interface DecisionResult {
  scenario_name: string;
  monthly_expenses: number;
  lease_expenses: number;
  monthly_surplus: number;
  lease_surplus: number;
}

export interface ComparisonResult {
  first_result: DecisionResult;
  second_result: DecisionResult;
  lower_monthly_cost_scenario: string;
  monthly_difference: number;
}