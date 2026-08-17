"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { Card, Button, AlertDialog, toast } from "@heroui/react";
import { Trash, ExternalLink } from "lucide-react";

import { Prisma } from "@/generated/prisma/client";

type ComparisonWithScenarios = Prisma.ComparisonGetPayload<{
  include: { firstScenario: true; secondScenario: true };
}>;

interface Props {
  comp: ComparisonWithScenarios;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function ComparisonCard({ comp, onDelete }: Props) {
  const isTie = comp.monthlyDifference === 0;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(comp.id);

      if (result.success) {
        toast.success("Comparison deleted successfully!");
      } else {
        toast.danger(result.error || "Failed to delete comparison.");
      }
    } catch {
      toast.danger("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="transition-colors hover:border-primary/50 h-full flex flex-col">
      <Card.Header className="gap-1 pb-0 pt-4 px-4">
        <Card.Title className="text-base truncate">
          {comp.firstScenario?.name || "Option A"}{" "}
          <span className="text-muted font-normal text-xs mx-1">vs</span>{" "}
          {comp.secondScenario?.name || "Option B"}
        </Card.Title>
        <Card.Description className="text-xs">
          Saved on {new Date(comp.createdAt).toLocaleDateString()}
        </Card.Description>
      </Card.Header>

      <Card.Content className="pt-2 px-4 pb-4 flex flex-col flex-1">
        <div className="flex flex-col gap-1 mb-4 flex-1">
          <div className="text-sm">
            <span className="font-medium text-muted-foreground mr-1">
              Winner:
            </span>
            <span
              className={
                isTie
                  ? "font-semibold text-muted"
                  : "font-semibold text-success"
              }
            >
              {isTie ? "Tie" : comp.lowerMonthlyCostScenario}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium text-muted-foreground mr-1">
              Difference:
            </span>
            <span className="font-semibold">
              ${comp.monthlyDifference?.toLocaleString()} /mo
            </span>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 mt-auto">
          <AlertDialog>
            <Button
              aria-label="Delete comparison"
              className="bg-danger/10 text-danger hover:bg-danger hover:text-white"
              size="sm"
              variant="danger"
            >
              <Trash className="size-4 mr-1" /> Delete
            </Button>
            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog className="sm:max-w-[400px]">
                  <AlertDialog.CloseTrigger />
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
                      <strong>{comp.secondScenario?.name || "Option B"}</strong>
                      . This action cannot be undone.
                    </p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button slot="close" variant="tertiary">
                      Cancel
                    </Button>
                    <Button
                      isPending={isDeleting}
                      slot="close"
                      variant="danger"
                      onPress={handleDelete}
                    >
                      Delete
                    </Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>

          <NextLink href={`/compare?id=${comp.id}`}>
            <Button className="font-medium" size="sm" variant="secondary">
              Open <ExternalLink className="size-4 ml-1" />
            </Button>
          </NextLink>
        </div>
      </Card.Content>
    </Card>
  );
}
