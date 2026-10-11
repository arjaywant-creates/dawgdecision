"use client";

/** UI Components */
import { Surface } from "@heroui/react";

/** Icons */
import { MapPinned } from "lucide-react";

/**
 * UI shell for the housing-location map.
 */
export default function HousingLocationMap() {
  return (
    <section
      aria-labelledby="housing-locations-heading"
      className="mt-8 w-full"
    >
      <div className="overflow-hidden rounded-2xl border-2 border-primary/25 bg-content1 shadow-md">
        {/* Section header */}
        <div className="border-b border-separator/50 bg-content2/60 px-5 py-4 sm:px-6">
          <h2
            id="housing-locations-heading"
            className="text-xl font-semibold"
          >
            Housing Locations
          </h2>

          <p className="mt-1 text-sm text-default-500">
            See where your selected options are located and how they compare.
          </p>
        </div>

        {/* Map area */}
        <div className="flex h-[220px] w-full items-center justify-center bg-content2/30 px-6 sm:h-[280px] lg:h-[340px]">
          <p className="text-sm font-medium text-default-500">
            Interactive map will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}