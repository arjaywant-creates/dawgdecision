"use client";

import NextLink from "next/link";

import { Card, Button, AlertDialog } from "@heroui/react";
import { Trash, ExternalLink, Eye } from "lucide-react";

import { deleteFinancialPlanAction } from "./actions";

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

export default function FinancialPlanCard({
  plan,
}: FinancialPlanCardProps) {
  return (
    <Card className="h-full transition-colors hover:border-primary/50">
      <Card.Header className="flex flex-col items-start gap-1">
        <Card.Title className="line-clamp-2 text-xl font-bold">
          {plan.housingName}
        </Card.Title>

        <Card.Description>
          Saved {new Date(plan.savedDate).toLocaleDateString()}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-4">
        <div className="space-y-1">
          <p className="font-semibold">
            {plan.monthlyCost !== null
              ? `$${plan.monthlyCost.toLocaleString()}/month`
              : "Unknown monthly cost"}
          </p>

          <p className="text-default-500 text-sm">
            {plan.upfrontCost !== null
              ? `$${plan.upfrontCost.toLocaleString()} upfront`
              : "Unknown upfront cost"}
          </p>

          <p className="text-default-500 text-sm">
            {plan.fullTermCost !== null
              ? `$${plan.fullTermCost.toLocaleString()} full-term cost`
              : "Unknown full-term cost"}
          </p>
        </div>

        <p className="text-sm font-medium text-default-700 pt-1">
          {plan.impactSummary}
        </p>
      </Card.Content>

      <Card.Footer className="mt-auto flex flex-wrap gap-2 pt-3">
        <NextLink href={`/plan/${plan.id}`}>
          <Button size="sm" variant="primary">
            <Eye className="size-4" />
            View Plan
          </Button>
        </NextLink>

        <NextLink href={`/compare?id=${plan.comparisonId}`}>
          <Button size="sm" variant="secondary">
            <ExternalLink className="size-4" />
            Comparison
          </Button>
        </NextLink>

        <AlertDialog>
          <Button
            aria-label="Delete plan"
            size="sm"
            variant="danger"
          >
            <Trash className="size-4" />
            Delete
          </Button>

          <AlertDialog.Backdrop>
            <AlertDialog.Container>
              <AlertDialog.Dialog>
                <AlertDialog.CloseTrigger />

                <AlertDialog.Header>
                  <AlertDialog.Heading>
                    Delete Financial Plan?
                  </AlertDialog.Heading>
                </AlertDialog.Header>

                <AlertDialog.Body>
                  This action cannot be undone.
                </AlertDialog.Body>

                <AlertDialog.Footer>
                  <Button slot="close" variant="secondary">
                    Cancel
                  </Button>

                  <Button
                    slot="close"
                    variant="danger"
                    onPress={() =>
                      deleteFinancialPlanAction(plan.id)
                    }
                  >
                    Delete
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