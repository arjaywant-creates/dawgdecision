"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, Spinner, Surface } from "@heroui/react";

import {
  HousingSourcesResponse,
  SourcedHousingOption,
} from "@/types/sourced-housing";

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
  onSelect: (option: SourcedHousingOption | null) => void;
}

export default function SourcedHousingSelector({
  label = "Sourced Housing",
  onSelect,
}: Props) {
  const [options, setOptions] = useState<SourcedHousingOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

        const response = await fetch(
          `${apiUrl}/api/housing-sources`,
        );

        if (!response.ok) {
          throw new Error("Failed to load housing sources");
        }

        const data: HousingSourcesResponse = await response.json();

        setOptions(data.housing_options ?? []);
      } catch (err: any) {
        setError(err.message ?? "Failed to load housing options");
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  const onCampus = useMemo(
    () => options.filter((o) => o.category === "on_campus"),
    [options],
  );

  const offCampus = useMemo(
    () => options.filter((o) => o.category === "off_campus"),
    [options],
  );

  const selectedOption =
    options.find((o) => o.id === selectedId) ?? null;

  if (loading) {
    return (
      <Surface className="p-4">
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          Loading sourced housing options...
        </div>
      </Surface>
    );
  }

  if (error) {
    return (
      <Alert status="danger">
        Failed to load sourced housing options.
      </Alert>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="font-semibold text-sm uppercase tracking-wide text-primary mb-3">
        {label}
      </h4>

      <select
        className="w-full rounded-lg border px-3 py-2 dark:[color-scheme:dark]"
        value={selectedId}
        onChange={(e) => {
          const value = e.target.value;

          setSelectedId(value);

          if (!value) {
            setSelectedId("");
            onSelect(null);
            return;
          }

          const selected =
            options.find((o) => o.id === value) ?? null;

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
              className="bg-white text-black dark:bg-zinc-900 dark:text-white"
              key={option.id}
              value={option.id}
            >
              {option.property_name} — {option.configuration}
            </option>
          ))}
        </optgroup>

        <optgroup
          className="bg-white text-black dark:bg-zinc-900 dark:text-white"
          label="Off-Campus"
        >
          {offCampus.map((option) => (
            <option
              className="bg-white text-black dark:bg-zinc-900 dark:text-white"
              key={option.id}
              value={option.id}
            >
              {option.property_name} — {option.configuration}
            </option>
          ))}
        </optgroup>
      </select>

      {selectedOption && (
        <Surface className="mt-3 p-4">
          <div className="flex flex-col gap-2 text-sm">
            <p>
              <strong>Source:</strong>{" "}
              {selectedOption.source_name}
            </p>

            <p>
              <strong>Last Updated:</strong>{" "}
              {selectedOption.last_checked}
            </p>

            <p>
              <strong>Pricing:</strong>{" "}
              {getPriceTypeLabel(selectedOption.price_type)}
            </p>

            <a
              className="text-primary underline"
              href={selectedOption.source_url}
              rel="noopener noreferrer"
              target="_blank"
            >
              View
            </a>

            {selectedOption.source_notes && (
              <p>{selectedOption.source_notes}</p>
            )}
          </div>
        </Surface>
      )}
    </div>
  );
}