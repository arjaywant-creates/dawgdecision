"use server";

import { z } from "zod";

import housingData from "@/data/housing_sources.json";

const SourceMetadataSchema = z.object({
  name: z.string(),
  url: z.url(),
  last_checked: z.string(),
  notes: z.string().nullable(),
});

const HousingOptionSchema = z.object({
  id: z.string(),
  category: z.enum(["on_campus", "off_campus"]),
  property_name: z.string(),
  configuration: z.string(),
  housing_cost: z.number(),
  price_type: z.string(),
  cost_period_months: z.number(),
  contract_months: z.number().nullable(),
  utilities: z.number().nullable(),
  mandatory_fees: z.number().nullable(),
  parking: z.number().nullable(),
  transportation: z.number().nullable(),
  upfront_costs: z.number().nullable(),
  commute_minutes: z.number().nullable(),
  source: SourceMetadataSchema,
});

export type HousingOption = z.infer<typeof HousingOptionSchema>;

const HousingDatasetSchema = z.object({
  housing_options: z.array(HousingOptionSchema),
});

let _cachedDataset: HousingOption[] | null = null;

export async function clearHousingCache() {
  _cachedDataset = null;
}

async function loadDataset(): Promise<HousingOption[]> {
  if (_cachedDataset) {
    return _cachedDataset;
  }

  try {
    // Validate the imported JSON
    const parsedData = HousingDatasetSchema.parse(housingData);

    _cachedDataset = parsedData.housing_options;

    return _cachedDataset;
  } catch (error) {
    console.error("Failed to load or validate housing sources:", error);
    throw error;
  }
}

export async function getHousingSources(): Promise<{
  housing_options: HousingOption[];
}> {
  const options = await loadDataset();

  return { housing_options: options };
}

export async function getHousingSourceById(
  id: string,
): Promise<HousingOption | null> {
  const options = await loadDataset();
  const option = options.find((o) => o.id === id);

  if (!option) {
    return null;
  }

  return option;
}
