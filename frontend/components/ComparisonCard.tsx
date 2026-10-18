"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import clsx from "clsx";

import {
  Card,
  Button,
  AlertDialog,
  Dropdown,
  Tooltip,
  Spinner,
} from "@heroui/react";

import { Trash, ExternalLink, Plus } from "lucide-react";

import { toast } from "@/lib/toast";

import { Prisma } from "@/generated/prisma/client";

import { setFinancialPlanHousingAction } from "@/app/plan/actions";

type ComparisonWithScenarios = Prisma.ComparisonGetPayload<{
  include: { firstScenario: true; secondScenario: true };
}>;

interface Props {
  comp: ComparisonWithScenarios;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function ComparisonCard({ comp, onDelete }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(comp.id);

      if (result.success) {
        toast.success("Comparison deleted successfully!");
        setIsAlertOpen(false);
      } else {
        toast.danger(result.error || "Failed to delete comparison.");
      }
    } catch {
      toast.danger("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddToPlan = async (scenarioKey: "A" | "B") => {
    setIsAdding(true);
    try {
      const selectedName =
        scenarioKey === "A"
          ? comp.firstScenario?.name
          : comp.secondScenario?.name;

      // Track the event in PostHog when a comparison is added to the financial plan
      posthog.capture("financial_plan_created", {
        comparison_id: comp.id,
        selected_scenario: scenarioKey,
        property_name: selectedName,
      });
      await setFinancialPlanHousingAction(comp.id, scenarioKey);
      router.push("/plan");
    } catch (e: any) {
      toast.danger(e.message || "Failed to add to plan");
    } finally {
      setIsAdding(false);
    }
  };

  const periodA = comp.firstScenario?.costPeriodMonths || 1;
  const monthlyA =
    comp.firstScenario?.housingCost !== undefined &&
    comp.firstScenario?.housingCost !== null
      ? comp.firstScenario.housingCost / periodA
      : null;

  const periodB = comp.secondScenario?.costPeriodMonths || 1;
  const monthlyB =
    comp.secondScenario?.housingCost !== undefined &&
    comp.secondScenario?.housingCost !== null
      ? comp.secondScenario.housingCost / periodB
      : null;

  const isBusy = isDeleting || isAdding;

  return (
    <Card className="transition-colors h-full min-w-0 flex flex-col">
      <Card.Header className="flex flex-col items-start gap-0.5 pb-1">
        <Card.Title className="text-sm sm:text-base font-semibold text-foreground w-full truncate">
          {comp.firstScenario?.name || "Option A"}{" "}
          <span className="text-default-400 font-normal text-xs mx-1">vs</span>{" "}
          {comp.secondScenario?.name || "Option B"}
        </Card.Title>
        <Card.Description className="text-xs text-default-400 font-normal">
          Saved on {new Date(comp.createdAt).toLocaleDateString()}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col flex-1 py-2 gap-2">
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="font-medium text-default-700 leading-snug">
            {comp.firstScenario?.name || "Option A"}
          </span>
          <div className="flex flex-col items-end shrink-0 text-right">
            <span className="font-semibold text-foreground">
              {monthlyA !== null
                ? `$${Math.round(monthlyA).toLocaleString()}/mo`
                : "Varies"}
            </span>
            {periodA > 1 && comp.firstScenario?.housingCost && (
              <span className="text-[11px] text-default-400">
                (${comp.firstScenario.housingCost.toLocaleString()}/term)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="font-medium text-default-700 leading-snug">
            {comp.secondScenario?.name || "Option B"}
          </span>
          <div className="flex flex-col items-end shrink-0 text-right">
            <span className="font-semibold text-foreground">
              {monthlyB !== null
                ? `$${Math.round(monthlyB).toLocaleString()}/mo`
                : "Varies"}
            </span>
            {periodB > 1 && comp.secondScenario?.housingCost && (
              <span className="text-[11px] text-default-400">
                (${comp.secondScenario.housingCost.toLocaleString()}/term)
              </span>
            )}
          </div>
        </div>
      </Card.Content>

      <Card.Footer className="flex items-center justify-end gap-2 pt-2 mt-auto">
        <NextLink
          aria-label="Open comparison"
          className={clsx(
            "button button--outline button--sm border-default-200 font-medium text-sm gap-1.5",
            isBusy && "pointer-events-none opacity-50",
          )}
          href={`/compare?id=${comp.id}`}
        >
          <ExternalLink className="size-3.5" />
          Open
        </NextLink>

        <Dropdown>
          <Button
            className="border-default-200 font-medium text-sm gap-1.5"
            isDisabled={isBusy}
            isPending={isAdding}
            size="sm"
            variant="outline"
          >
            {({ isPending }) => (
              <>
                {isPending ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                {isPending ? "Adding..." : "Add to Plan"}
              </>
            )}
          </Button>
          <Dropdown.Popover className="min-w-[280px] sm:min-w-[320px] p-1">
            <div className="px-3 pt-2 pb-1.5 text-xs font-semibold text-default-500">
              Add to Financial Plan
            </div>
            <Dropdown.Menu
              onAction={(key) => handleAddToPlan(key as "A" | "B")}
            >
              <Dropdown.Item
                id="A"
                isDisabled={isBusy}
                textValue={comp.firstScenario?.name || "Option A"}
              >
                <div className="flex flex-col gap-0.5 py-1 w-full text-left">
                  <span className="text-sm font-medium text-foreground leading-snug">
                    {comp.firstScenario?.name || "Option A"}
                  </span>
                  <span className="text-xs text-default-500">
                    {monthlyA !== null
                      ? `$${Math.round(monthlyA).toLocaleString()}/mo`
                      : `$${comp.firstScenario?.housingCost?.toLocaleString()}`}
                    {periodA > 1 &&
                      comp.firstScenario?.housingCost &&
                      ` ($${comp.firstScenario.housingCost.toLocaleString()}/term)`}
                  </span>
                </div>
              </Dropdown.Item>
              <Dropdown.Item
                id="B"
                isDisabled={isBusy}
                textValue={comp.secondScenario?.name || "Option B"}
              >
                <div className="flex flex-col gap-0.5 py-1 w-full text-left">
                  <span className="text-sm font-medium text-foreground leading-snug">
                    {comp.secondScenario?.name || "Option B"}
                  </span>
                  <span className="text-xs text-default-500">
                    {monthlyB !== null
                      ? `$${Math.round(monthlyB).toLocaleString()}/mo`
                      : `$${comp.secondScenario?.housingCost?.toLocaleString()}`}
                    {periodB > 1 &&
                      comp.secondScenario?.housingCost &&
                      ` ($${comp.secondScenario.housingCost.toLocaleString()}/term)`}
                  </span>
                </div>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <AlertDialog isOpen={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <Tooltip delay={0}>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                aria-label="Delete comparison"
                isDisabled={isBusy}
                size="sm"
                variant="danger"
                onPress={() => setIsAlertOpen(true)}
              >
                <Trash className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Delete</Tooltip.Content>
          </Tooltip>
          <AlertDialog.Backdrop>
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                <AlertDialog.CloseTrigger isDisabled={isDeleting} />
                <AlertDialog.Header>
                  <AlertDialog.Icon status="danger" />
                  <AlertDialog.Heading>
                    Delete comparison permanently?
                  </AlertDialog.Heading>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <p>
                    This will permanently delete the comparison between{" "}
                    <strong>{comp.firstScenario?.name || "Option A"}</strong>{" "}
                    and{" "}
                    <strong>{comp.secondScenario?.name || "Option B"}</strong>.
                    This action cannot be undone.
                  </p>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <Button
                    isDisabled={isDeleting}
                    slot="close"
                    variant="tertiary"
                  >
                    Cancel
                  </Button>
                  <Button
                    isDisabled={isDeleting}
                    isPending={isDeleting}
                    variant="danger"
                    onPress={handleDelete}
                  >
                    {({ isPending }) => (
                      <>
                        {isPending && <Spinner color="current" size="sm" />}
                        {isPending ? "Deleting..." : "Delete"}
                      </>
                    )}
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </Card.Footer>
    </Card>
  );
}
