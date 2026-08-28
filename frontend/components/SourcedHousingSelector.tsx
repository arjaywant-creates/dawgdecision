"use client";

import { useMemo } from "react";

import { Surface, Alert } from "@heroui/react";

import { SourcedHousingOption } from "@/types/sourced-housing";

function getPriceTypeLabel(priceType: string) {
  switch (priceType) {
    case "term_rate":
      return "Term Rate";

    case "starting_at":
      return "Starting At";

    case "starting_inclusive_installment":
      return "Starting Price (Inclusive Installment)";

    default:
      return priceType;
  }
}

interface Props {
  label?: string;
  options: SourcedHousingOption[];
  onSelect: (option: SourcedHousingOption | null) => void;
  apiError?: boolean;
  selectedId: string;
}

export default function SourcedHousingSelector({
  label = "Sourced Housing",
  options,
  onSelect,
  apiError,
  selectedId,
}: Props) {
  const onCampus = useMemo(
    () => options.filter((o) => o.category === "on_campus"),
    [options],
  );

  const offCampus = useMemo(
    () => options.filter((o) => o.category === "off_campus"),
    [options],
  );

  const selectedOption = options.find((o) => o.id === selectedId) ?? null;

  return (
    <div className="mb-6">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-primary mb-3">
        {label}
      </h4>

      {apiError && (
        <Alert className="mb-3" color="danger">
          Failed to load housing options. Manual entry is available.
        </Alert>
      )}

      <select
        className="w-full rounded-lg border px-3 py-2 dark:[color-scheme:dark]"
        value={selectedId}
        onChange={(e) => {
          const value = e.target.value;

          if (!value) {
            onSelect(null);

            return;
          }

          const selected = options.find((o) => o.id === value) ?? null;

          onSelect(selected);
        }}
      >
        <option
          className="bg-white text-black dark:bg-zinc-900 dark:text-white"
          value=""
        >
          Manual Entry (Ignore Sourced Data)
        </option>

        <optgroup
          className="bg-white text-black dark:bg-zinc-900 dark:text-white"
          label="On-Campus"
        >
          {onCampus.map((option) => (
            <option
              key={option.id}
              className="bg-white text-black dark:bg-zinc-900 dark:text-white"
              value={option.id}
            >
              {option.property_name} - {option.configuration}
            </option>
          ))}
        </optgroup>

        <optgroup
          className="bg-white text-black dark:bg-zinc-900 dark:text-white"
          label="Off-Campus"
        >
          {offCampus.map((option) => (
            <option
              key={option.id}
              className="bg-white text-black dark:bg-zinc-900 dark:text-white"
              value={option.id}
            >
              {option.property_name} - {option.configuration}
            </option>
          ))}
        </optgroup>
      </select>

      {selectedOption && (
        <Surface className="mt-3 p-4">
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <strong>Source:</strong> {selectedOption.source.name}
            </p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {selectedOption.source.last_checked}
            </p>

            <p>
              <strong>Pricing:</strong>{" "}
              {getPriceTypeLabel(selectedOption.price_type)}
            </p>

            <a
              className="text-primary underline"
              href={selectedOption.source.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              View
            </a>

            {selectedOption.source.notes && (
              <p>{selectedOption.source.notes}</p>
            )}
          </div>
        </Surface>
      )}
    </div>
  );
}
