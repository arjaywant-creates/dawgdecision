import { z } from "zod";

export const SourceMetadataSchema = z.object({
  name: z.string(),
  url: z.string(),
  last_checked: z.string(),
  notes: z.string().nullable().optional(),
});

export const SourcedHousingOptionSchema = z.object({
  id: z.string(),
  category: z.enum(["on_campus", "off_campus"]),
  property_name: z.string(),
  configuration: z.string(),
  property_style: z.string().optional(),
  housing_cost: z.number().nullable(),
  price_type: z.string(),
  cost_period_months: z.number().nullable(),
  contract_months: z.number().nullable(),
  utilities: z.number().nullable(),
  mandatory_fees: z.number().nullable(),
  parking: z.number().nullable(),
  transportation: z.number().nullable(),
  upfront_costs: z.number().nullable(),
  commute_minutes: z.number().nullable(),
  source: SourceMetadataSchema,
  address: z.string().nullable().optional(),
  coordinates: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .nullable()
    .optional(),
});

export type SourcedHousingOption = z.infer<typeof SourcedHousingOptionSchema>;

export const HousingSourcesResponseSchema = z.object({
  housing_options: z.array(SourcedHousingOptionSchema),
});

export type HousingSourcesResponse = z.infer<
  typeof HousingSourcesResponseSchema
>;
