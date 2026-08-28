"use client";

import { useEffect, useMemo, useState } from "react";

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
import { Alert, Button, Spinner, Surface } from "@heroui/react";

import {
  HousingSourcesResponse,
  SourcedHousingOption,
} from "@/types/sourced-housing";

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

        const response = await fetch(
          "http://localhost:8000/api/housing-sources",
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
        className="w-full rounded-lg border px-3 py-2"
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
        <option value="">
          Manual Entry (Ignore Sourced Data)
        </option>

        <optgroup label="On-Campus">
          {onCampus.map((option) => (
            <option key={option.id} value={option.id}>
              {option.property_name} — {option.configuration}
            </option>
          ))}
        </optgroup>

        <optgroup label="Off-Campus">
          {offCampus.map((option) => (
            <option key={option.id} value={option.id}>
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
            href={selectedOption.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
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