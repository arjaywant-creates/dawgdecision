import { SourcedHousingOption } from "@/types/sourced-housing";

export interface PropertyLocation {
  propertyName: string;
  category?: "on_campus" | "off_campus" | string;
  address?: string;
  lat: number;
  lng: number;
}

export const UGA_CAMPUS_CENTER = {
  name: "UGA Campus (Athens)",
  lat: 33.9519,
  lng: -83.3764,
  defaultZoom: 14,
};

/**
 * Resolves a map location from a sourced housing option.
 * From `data/housing_sources.json`.
 * Returns null for options without coordinates.
 */
export function getPropertyLocation(
  option?: SourcedHousingOption | null,
): PropertyLocation | null {
  const lat = option?.coordinates?.lat;
  const lng = option?.coordinates?.lng;

  if (!option || typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return {
    propertyName: option.property_name,
    category: option.category,
    address: option.address ?? undefined,
    lat,
    lng,
  };
}
