export type HousingCategory = "on_campus" | "off_campus";

export type PriceType =
  | "term_rate"
  | "starting_at"
  | "starting_inclusive_installment"
  | string;

export interface SourcedHousingOption {
  id: string;

  category: HousingCategory;

  property_name: string;
  configuration: string;

  housing_cost: number | null;
  price_type: PriceType;

  cost_period_months: number | null;
  contract_months: number | null;

  utilities: number | null;
  mandatory_fees: number | null;
  parking: number | null;
  transportation: number | null;
  upfront_costs: number | null;
  commute_minutes: number | null;

  source_name: string;
  source_url: string;
  last_checked: string;

  source_notes?: string | null;
}

export interface HousingSourcesResponse {
  housing_options: SourcedHousingOption[];
}