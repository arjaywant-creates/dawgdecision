"use client";

import { useMemo } from "react";
import {
  Alert,
  Select,
  Label,
  ListBox,
  Header,
  Separator,
  Button,
  Tooltip,
} from "@heroui/react";

import { ExternalLink } from "lucide-react";

import { OutlineSurface } from "./OutlineSurface";

import { SourcedHousingOption } from "@/types/sourced-housing";

function getPriceTypeLabel(priceType: string) {
  switch (priceType) {
    case "term_rate":
      return "Term Rate";
    case "starting_at":
      return "Starting At";
    case "starting_inclusive_installment":
      return "Starting Price (Inclusive Installment)";
    case "per_installment":
      return "Per Installment";
    case "per_month":
      return "Per Month";
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
    <div className="mb-2 w-full">
      {apiError && (
        <Alert className="mb-4" status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load housing options</Alert.Title>
            <Alert.Description>Manual entry is available.</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Select
        className="w-full"
        placeholder="Manual Entry (Ignore Sourced Data)"
        selectedKey={selectedId || null}
        variant="secondary"
        onSelectionChange={(k) => {
          const val = k as string;

          if (!val) {
            onSelect(null);

            return;
          }
          const selected = options.find((o) => o.id === val) ?? null;

          onSelect(selected);
        }}
      >
        <Label className="font-semibold text-sm uppercase tracking-wide text-primary">
          {label}
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {onCampus.length > 0 && (
              <ListBox.Section>
                <Header>On-Campus</Header>
                {onCampus.map((option) => (
                  <ListBox.Item
                    key={option.id}
                    id={option.id}
                    textValue={`${option.property_name} - ${option.configuration}`}
                  >
                    {option.property_name} - {option.configuration}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox.Section>
            )}

            {onCampus.length > 0 && offCampus.length > 0 && <Separator />}

            {offCampus.length > 0 && (
              <ListBox.Section>
                <Header>Off-Campus</Header>
                {offCampus.map((option) => (
                  <ListBox.Item
                    key={option.id}
                    id={option.id}
                    textValue={`${option.property_name} - ${option.configuration}`}
                  >
                    {option.property_name} - {option.configuration}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox.Section>
            )}
          </ListBox>
        </Select.Popover>
      </Select>

      {selectedOption && (
        <OutlineSurface className="mt-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-default-700">
                <strong className="text-foreground">Source:</strong>{" "}
                {selectedOption.source.name}
              </p>
              <p className="text-sm text-default-700">
                <strong className="text-foreground">Pricing:</strong>{" "}
                {getPriceTypeLabel(selectedOption.price_type)}
              </p>
              <p className="text-xs text-default-500">
                Last Updated: {selectedOption.source.last_checked}
              </p>

              <div className="mt-1.5">
                <Tooltip delay={0}>
                  <Tooltip.Trigger>
                    <a
                      className="inline-block"
                      href={selectedOption.source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Button
                        className="h-6 px-2 text-[10px] font-medium border-default-200 min-w-0"
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="size-3 mr-1" />
                        Source
                      </Button>
                    </a>
                  </Tooltip.Trigger>
                  <Tooltip.Content className="max-w-[250px] p-2">
                    <span className="text-[10px] break-all">
                      {selectedOption.source.url}
                    </span>
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </div>

            {selectedOption.source.notes && (
              <p className="text-xs text-default-600 leading-relaxed mt-2">
                <strong className="text-default-700">Note: </strong>
                {selectedOption.source.notes}
              </p>
            )}
          </div>
        </OutlineSurface>
      )}
    </div>
  );
}
