"use client";

import { useState } from "react";
import NextLink from "next/link";
import clsx from "clsx";

import { Card, Button, AlertDialog, Tooltip, Spinner } from "@heroui/react";

import { Trash, ExternalLink, Eye } from "lucide-react";

import { deleteFinancialPlanAction } from "./actions";

import { toast } from "@/lib/toast";

interface FinancialPlanCardProps {
  plan: {
    id: string;
    comparisonId: string;

    housingName: string;

    savedDate: string;

    monthlyCost: number | null;
    upfrontCost: number | null;
    fullTermCost: number | null;

    impactSummary: string;
  };
}

export default function FinancialPlanCard({ plan }: FinancialPlanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteFinancialPlanAction(plan.id);

      if (result.success) {
        toast.success("Financial plan deleted successfully!");
        setIsAlertOpen(false);
      } else {
        toast.danger(result.error || "Failed to delete plan.");
      }
    } catch {
      toast.danger("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="transition-colors h-full min-w-0 flex flex-col">
      <Card.Header className="flex flex-col items-start gap-1 pb-1">
        <Card.Title className="text-base sm:text-lg font-semibold text-foreground w-full truncate">
          {plan.housingName}
        </Card.Title>
        <Card.Description className="text-xs text-default-500 font-normal">
          Saved on {new Date(plan.savedDate).toLocaleDateString()}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col flex-1 py-2 gap-3 text-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-default-600">
              True Monthly Cost
            </span>
            <span className="text-lg sm:text-xl font-semibold text-foreground">
              {plan.monthlyCost !== null
                ? `$${Math.round(plan.monthlyCost).toLocaleString()}`
                : "Unknown"}
              <span className="text-xs font-normal text-default-500 ml-0.5">
                /mo
              </span>
            </span>
          </div>

          <div className="flex items-baseline justify-between text-sm text-default-600">
            <span>Upfront Costs</span>
            <span className="font-medium text-foreground">
              {plan.upfrontCost !== null
                ? `$${plan.upfrontCost.toLocaleString()}`
                : "None"}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-sm text-default-600">
            <span>Full-Term Commitment</span>
            <span className="font-medium text-foreground">
              {plan.fullTermCost !== null
                ? `$${Math.round(plan.fullTermCost).toLocaleString()}`
                : "Unknown"}
            </span>
          </div>
        </div>

        {plan.impactSummary && (
          <p className="text-sm text-default-600 leading-relaxed mt-auto pt-2">
            <span className="font-medium text-default-700">Impact: </span>
            {plan.impactSummary}
          </p>
        )}
      </Card.Content>

      <Card.Footer className="flex items-center justify-end gap-2 pt-2 mt-auto">
        <NextLink
          aria-label="View plan"
          className={clsx(
            "button button--outline button--sm border-default-200 font-medium text-sm gap-1.5",
            isDeleting && "pointer-events-none opacity-50",
          )}
          href={`/plan/${plan.id}`}
        >
          <Eye className="size-3.5" />
          View Plan
        </NextLink>

        <NextLink
          aria-label="Open comparison"
          className={clsx(
            "button button--outline button--sm border-default-200 font-medium text-sm gap-1.5",
            isDeleting && "pointer-events-none opacity-50",
          )}
          href={`/compare?id=${plan.comparisonId}`}
        >
          <ExternalLink className="size-3.5" />
          Comparison
        </NextLink>

        <AlertDialog isOpen={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <Tooltip delay={0}>
            <Tooltip.Trigger>
              <Button
                isIconOnly
                aria-label="Delete plan"
                isDisabled={isDeleting}
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
                    Delete Financial Plan?
                  </AlertDialog.Heading>
                </AlertDialog.Header>

                <AlertDialog.Body>
                  <p>
                    This will permanently delete this financial plan for{" "}
                    <strong>{plan.housingName}</strong>. Your original
                    comparison will remain intact.
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
