"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Label,
  Modal,
  SearchField,
  Tooltip,
  EmptyState,
  ListBox,
  Select,
} from "@heroui/react";

import {
  ExternalLink,
  Search,
  Home,
  Info,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
} from "lucide-react";

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

function getPriceSuffix(priceType: string) {
  if (priceType === "term_rate") return "/term";
  if (priceType.includes("installment")) return "/inst.";

  return "/mo";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filters & Sorting
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("category_on_first");

  const selectedOption = options.find((o) => o.id === selectedId) ?? null;

  const propertyStyles = useMemo(() => {
    const styles = new Set<string>();

    options.forEach((o) => {
      if (o.property_style) styles.add(o.property_style);
    });

    return Array.from(styles).sort();
  }, [options]);

  const filteredOptions = useMemo(() => {
    return options.filter((o) => {
      if (categoryFilter !== "all" && o.category !== categoryFilter)
        return false;
      if (styleFilter !== "all" && o.property_style !== styleFilter)
        return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();

      return (
        o.property_name.toLowerCase().includes(query) ||
        o.configuration.toLowerCase().includes(query) ||
        o.category.toLowerCase().replace("_", " ").includes(query) ||
        (o.property_style && o.property_style.toLowerCase().includes(query))
      );
    });
  }, [options, searchQuery, categoryFilter, styleFilter]);

  const sortedOptions = useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      const costA = a.housing_cost || 0;
      const costB = b.housing_cost || 0;

      if (sortOption === "category_on_first") {
        if (a.category === "on_campus" && b.category !== "on_campus") return -1;
        if (a.category !== "on_campus" && b.category === "on_campus") return 1;

        return a.property_name.localeCompare(b.property_name);
      } else if (sortOption === "category_off_first") {
        if (a.category === "off_campus" && b.category !== "off_campus")
          return -1;
        if (a.category !== "off_campus" && b.category === "off_campus")
          return 1;

        return a.property_name.localeCompare(b.property_name);
      } else if (sortOption === "name_asc") {
        return a.property_name.localeCompare(b.property_name);
      } else if (sortOption === "rent_asc") {
        return costA - costB;
      } else if (sortOption === "rent_desc") {
        return costB - costA;
      }

      return 0;
    });
  }, [filteredOptions, sortOption]);

  return (
    <div className="mb-2 w-full min-w-0">
      {apiError && (
        <Alert className="mb-4" status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load housing options</Alert.Title>
            <Alert.Description>Manual entry is available.</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Label className="font-semibold text-sm uppercase tracking-wide text-foreground block mb-2">
        {label}
      </Label>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button
          className="w-full justify-between bg-surface-secondary px-4 min-h-11 h-auto py-2 border border-separator/30 min-w-0 rounded-field"
          variant="outline"
          onPress={() => setIsOpen(true)}
        >
          <span className="block mr-2 flex-1 text-left font-normal text-foreground whitespace-normal break-words min-w-0">
            {selectedOption
              ? `${selectedOption.property_name} - ${selectedOption.configuration}`
              : "Search Housing Options"}
          </span>
          <Search className="size-4 text-muted shrink-0" />
        </Button>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[800px] w-[95vw] max-h-[95vh] flex flex-col p-0 overflow-hidden">
              <div className="flex flex-col h-full max-h-full">
                <Modal.Header className="shrink-0 p-4 pb-3 border-b border-separator/30 flex flex-col items-stretch gap-4">
                  <Modal.Heading className="text-foreground flex items-center gap-2 text-lg">
                    <Home className="size-5 text-foreground" />
                    Select Housing Option
                  </Modal.Heading>
                  <Modal.CloseTrigger className="absolute top-4 right-4" />

                  {/* Search and Filters */}
                  <div className="flex flex-col gap-3 mt-1">
                    <SearchField
                      aria-label="Search options"
                      className="w-full"
                      value={searchQuery}
                      variant="secondary"
                      onChange={setSearchQuery}
                    >
                      <SearchField.Group className="flex items-center">
                        <SearchField.SearchIcon />
                        <SearchField.Input placeholder="Search property or config..." />
                        <SearchField.ClearButton />
                      </SearchField.Group>
                    </SearchField>

                    <div className="flex gap-2 sm:gap-4 w-full flex-col sm:flex-row flex-wrap">
                      <Select
                        aria-label="Category Filter"
                        className="flex-1 min-w-[140px]"
                        selectedKey={categoryFilter}
                        variant="secondary"
                        onSelectionChange={(key) => {
                          if (key) setCategoryFilter(key as string);
                        }}
                      >
                        <Select.Trigger className="w-full flex items-center">
                          <SlidersHorizontal className="size-4 text-muted mr-2" />
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item id="all" textValue="All Categories">
                              All Categories
                            </ListBox.Item>
                            <ListBox.Item id="on_campus" textValue="On-Campus">
                              On-Campus
                            </ListBox.Item>
                            <ListBox.Item
                              id="off_campus"
                              textValue="Off-Campus"
                            >
                              Off-Campus
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>

                      <Select
                        aria-label="Style Filter"
                        className="flex-1 min-w-[140px]"
                        selectedKey={styleFilter}
                        variant="secondary"
                        onSelectionChange={(key) => {
                          if (key) setStyleFilter(key as string);
                        }}
                      >
                        <Select.Trigger className="w-full flex items-center">
                          <SlidersHorizontal className="size-4 text-muted mr-2" />
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item id="all" textValue="All Styles">
                              All Styles
                            </ListBox.Item>
                            {propertyStyles.map((style) => (
                              <ListBox.Item
                                key={style}
                                id={style}
                                textValue={style}
                              >
                                {style}
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>

                      <Select
                        aria-label="Sort Options"
                        className="flex-1 min-w-[160px]"
                        selectedKey={sortOption}
                        variant="secondary"
                        onSelectionChange={(key) => {
                          if (key) setSortOption(key as string);
                        }}
                      >
                        <Select.Trigger className="w-full flex items-center">
                          <ArrowUpDown className="size-4 text-muted mr-2" />
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            <ListBox.Item id="name_asc" textValue="Name (A-Z)">
                              Name (A-Z)
                            </ListBox.Item>
                            <ListBox.Item
                              id="category_on_first"
                              textValue="On-Campus First"
                            >
                              On-Campus First
                            </ListBox.Item>
                            <ListBox.Item
                              id="category_off_first"
                              textValue="Off-Campus First"
                            >
                              Off-Campus First
                            </ListBox.Item>
                            <ListBox.Item
                              id="rent_asc"
                              textValue="Rent (Low to High)"
                            >
                              Rent (Low to High)
                            </ListBox.Item>
                            <ListBox.Item
                              id="rent_desc"
                              textValue="Rent (High to Low)"
                            >
                              Rent (High to Low)
                            </ListBox.Item>
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </div>
                  </div>
                </Modal.Header>

                <Modal.Body className="p-3 pt-2 overflow-y-auto outline-none">
                  {sortedOptions.length === 0 ? (
                    <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center p-10">
                      <Info className="size-8 text-muted" />
                      <span className="text-base font-medium text-foreground">
                        No housing options found
                      </span>
                      <span className="text-sm text-muted">
                        Try adjusting your search or filters.
                      </span>
                    </EmptyState>
                  ) : (
                    <ListBox
                      aria-label="Housing options list"
                      className="w-full outline-none gap-2"
                      items={sortedOptions}
                      selectedKeys={
                        selectedId ? new Set([selectedId]) : new Set()
                      }
                      selectionMode="single"
                      onSelectionChange={(keys) => {
                        const arr = Array.from(keys);

                        if (arr.length > 0) {
                          const key = arr[0] as string;
                          const opt = options.find((o) => o.id === key);

                          if (opt) {
                            onSelect(opt);
                            setIsOpen(false);
                          }
                        }
                      }}
                    >
                      {(item) => (
                        <ListBox.Item
                          key={item.id}
                          className="border border-default-200/20 rounded-xl py-3 px-4"
                          id={item.id}
                          textValue={item.property_name}
                        >
                          <div
                            className={`flex justify-between items-center gap-4 flex-1 min-w-0 ${
                              item.id === selectedId ? "pr-6" : ""
                            }`}
                          >
                            <div className="flex flex-col min-w-0 gap-0.5">
                              <span className="font-semibold text-foreground truncate">
                                {item.property_name}
                              </span>
                              <div className="flex flex-col gap-0.5 text-muted min-w-0">
                                <span className="text-sm truncate">
                                  {item.configuration}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs truncate">
                                  {item.property_style && (
                                    <>
                                      <span className="truncate">
                                        {item.property_style}
                                      </span>
                                      <span className="shrink-0 text-[10px] opacity-60">
                                        •
                                      </span>
                                    </>
                                  )}
                                  <span className="shrink-0 truncate">
                                    {item.category === "on_campus"
                                      ? "On-Campus"
                                      : "Off-Campus"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end shrink-0">
                              <span className="font-medium text-foreground whitespace-nowrap text-right">
                                {item.housing_cost ? (
                                  <>
                                    {item.price_type.includes("starting") && (
                                      <span className="text-xs text-muted font-normal mr-1">
                                        From
                                      </span>
                                    )}
                                    ${item.housing_cost}
                                  </>
                                ) : (
                                  "Varies"
                                )}
                                {item.housing_cost && (
                                  <span className="text-xs text-muted font-normal ml-1">
                                    {getPriceSuffix(item.price_type)}
                                  </span>
                                )}
                              </span>
                              {(Boolean(
                                item.mandatory_fees && item.mandatory_fees > 0,
                              ) ||
                                Boolean(item.parking && item.parking > 0)) && (
                                <span className="text-[10px] text-muted whitespace-nowrap text-right mt-0.5">
                                  (+{" "}
                                  {Boolean(
                                    item.mandatory_fees &&
                                    item.mandatory_fees > 0,
                                  )
                                    ? `$${item.mandatory_fees} fees`
                                    : ""}
                                  {Boolean(
                                    item.mandatory_fees &&
                                    item.mandatory_fees > 0,
                                  ) && Boolean(item.parking && item.parking > 0)
                                    ? ", "
                                    : ""}
                                  {Boolean(item.parking && item.parking > 0)
                                    ? `$${item.parking} pkg`
                                    : ""}
                                  )
                                </span>
                              )}
                            </div>
                          </div>
                          <ListBox.ItemIndicator>
                            {({ isSelected }) =>
                              isSelected ? (
                                <Check className="size-4 shrink-0 text-primary" />
                              ) : null
                            }
                          </ListBox.ItemIndicator>
                        </ListBox.Item>
                      )}
                    </ListBox>
                  )}
                </Modal.Body>

                <Modal.Footer className="shrink-0 p-4 pt-3 border-t border-separator/30 flex-col sm:flex-row gap-2 bg-surface">
                  <Button
                    className="w-full sm:w-auto"
                    variant="outline"
                    onPress={() => {
                      onSelect(null);
                      setIsOpen(false);
                    }}
                  >
                    Clear Selection / Manual Entry
                  </Button>
                  <Button
                    className="w-full sm:w-auto ml-auto"
                    variant="primary"
                    onPress={() => setIsOpen(false)}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </div>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {selectedOption && (
        <OutlineSurface className="mt-3">
          <div className="flex flex-col gap-3 overflow-hidden">
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-default-700 break-words">
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
                      className="inline-block max-w-full"
                      href={selectedOption.source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Button
                        className="h-6 px-2 text-[10px] font-medium border-default-200 min-w-0 max-w-full"
                        size="sm"
                        variant="outline"
                      >
                        <ExternalLink className="size-3 mr-1 shrink-0" />
                        <span className="truncate">Source</span>
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
              <p className="text-xs text-default-600 leading-relaxed mt-2 break-words">
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
