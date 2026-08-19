import { z } from "zod";

/**
 * HTML number inputs return an empty string ("") when a user clears the field.
 * This helper schema accepts the empty string from React forms but transforms it
 * into a pure `null` before sending it to the Python API, which expects a Float or null.
 * It also coerces valid string numbers (e.g., "50") into actual Number types.
 */
const emptyStringToNull = z
  .union([
    z.coerce.number().min(0, "Cannot be negative"),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((e) => (e === "" ? null : e));

export const ScenarioSchema = z.object({
  name: z.string().min(1, "Name is required"),
  housing_cost: z.coerce.number().min(0, "Cannot be negative"),
  cost_period_months: z.coerce.number().min(1, "Must be at least 1 month"),
  contract_months: z.coerce.number().int().min(1, "Must be at least 1 month"),

  utilities: emptyStringToNull,
  mandatory_fees: emptyStringToNull,
  parking: emptyStringToNull,
  transportation: emptyStringToNull,
  upfront_costs: emptyStringToNull,
  commute_minutes: emptyStringToNull,
});

export type Scenario = z.infer<typeof ScenarioSchema>;

export const CompareRequestSchema = z.object({
  scenario_a: ScenarioSchema,
  scenario_b: ScenarioSchema,
});

export type CompareRequest = z.infer<typeof CompareRequestSchema>;

export const DecisionResultSchema = z.object({
  scenario_name: z.string(),
  monthly_housing_cost: z.number(),
  monthly_recurring_cost: z.number(),
  term_cost: z.number(),
  upfront_costs: z.number().nullable(),

  housing_cost: z.number(),
  utilities: z.number().nullable(),
  mandatory_fees: z.number().nullable(),
  parking: z.number().nullable(),
  transportation: z.number().nullable(),
  commute_minutes: z.number().nullable(),

  missing_recurring_costs: z.array(z.string()),
  recurring_costs_complete: z.boolean(),
  term_cost_complete: z.boolean(),
});

export type DecisionResult = z.infer<typeof DecisionResultSchema>;

export const TradeoffSchema = z.object({
  type: z.string(),
  favored_scenario: z.string().nullable(),
  difference: z.number(),
});

export type Tradeoff = z.infer<typeof TradeoffSchema>;

export const ComparisonResultSchema = z.object({
  first_result: DecisionResultSchema,
  second_result: DecisionResultSchema,

  monthly_difference: z.number(),
  term_difference: z.number().nullable(),

  housing_cost_difference: z.number(),
  utilities_difference: z.number().nullable(),
  mandatory_fees_difference: z.number().nullable(),
  parking_difference: z.number().nullable(),
  transportation_difference: z.number().nullable(),
  upfront_cost_difference: z.number().nullable(),
  commute_difference: z.number().nullable(),

  tradeoffs: z.array(TradeoffSchema),
});

export type ComparisonResult = z.infer<typeof ComparisonResultSchema>;
