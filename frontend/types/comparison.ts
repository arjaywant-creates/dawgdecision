import { z } from 'zod';

export const ScenarioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  monthly_income: z.coerce.number().min(0, "Cannot be negative"),
  rent: z.coerce.number().min(0, "Cannot be negative"),
  utilities: z.coerce.number().min(0, "Cannot be negative"),
  transportation: z.coerce.number().min(0, "Cannot be negative"),
  mandatory_fees: z.coerce.number().min(0, "Cannot be negative"),
  other_expenses: z.coerce.number().min(0, "Cannot be negative"),
  lease_months: z.coerce.number().int().positive("Lease must be at least 1 month"),
});

export type Scenario = z.infer<typeof ScenarioSchema>;

export const CompareRequestSchema = z.object({
  scenario_a: ScenarioSchema,
  scenario_b: ScenarioSchema,
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

export const DecisionResultSchema = z.object({
  scenario_name: z.string(),
  monthly_expenses: z.number(),
  lease_expenses: z.number(),
  monthly_surplus: z.number(),
  lease_surplus: z.number(),
});

export type DecisionResult = z.infer<typeof DecisionResultSchema>;

export const ComparisonResultSchema = z.object({
  first_result: DecisionResultSchema,
  second_result: DecisionResultSchema,
  lower_monthly_cost_scenario: z.string(),
  monthly_difference: z.number(),
});

export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;