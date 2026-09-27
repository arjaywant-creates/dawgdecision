"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button, AlertDialog, toast, Dropdown } from "@heroui/react";
import { Trash, ExternalLink, Plus } from "lucide-react";

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

  const handleAddToPlan = async (scenarioKey: "A" | "B") => {
    setIsAdding(true);
    try {
      await setFinancialPlanHousingAction(comp.id, scenarioKey);
      router.push("/plan");
    } catch (e: any) {
      toast.danger(e.message || "Failed to add to plan");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="transition-colors hover:border-primary/50 h-full flex flex-col min-w-0">
      <Card.Header className="gap-1">
        <Card.Title className="text-base">
          {comp.firstScenario?.name || "Option A"}{" "}
          <span className="text-muted font-normal text-xs mx-1">vs</span>{" "}
          {comp.secondScenario?.name || "Option B"}
        </Card.Title>
        <Card.Description className="text-xs">
          Saved on {new Date(comp.createdAt).toLocaleDateString()}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col flex-1">
        <div className="flex flex-col gap-2 flex-1">
          <div className="text-sm flex flex-col sm:flex-row sm:items-start sm:gap-1">
            <span className="text-muted-foreground font-medium">
              {comp.firstScenario?.name || "Option A"}:
            </span>
            <span className="font-semibold text-foreground">
              ${comp.firstScenario?.housingCost?.toLocaleString()}
            </span>
          </div>
          <div className="text-sm flex flex-col sm:flex-row sm:items-start sm:gap-1">
            <span className="text-muted-foreground font-medium">
              {comp.secondScenario?.name || "Option B"}:
            </span>
            <span className="font-semibold text-foreground">
              ${comp.secondScenario?.housingCost?.toLocaleString()}
            </span>
          </div>
        </div>
      </Card.Content>

      <Card.Footer className="mt-auto flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-end gap-2 pt-3">
        <NextLink className="w-full sm:w-auto" href={`/compare?id=${comp.id}`}>
          <Button
            aria-label="Open comparison"
            className="w-full"
            size="sm"
            variant="primary"
          >
            <ExternalLink className="size-4" />
            Open Comparison
          </Button>
        </NextLink>

        <div className="flex gap-2 w-full sm:w-auto">
          <Dropdown className="flex-1">
            <Button
              className="w-full"
              isPending={isAdding}
              size="sm"
              variant="secondary"
            >
              <Plus className="size-4" />
              Add to Plan
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => handleAddToPlan(key as "A" | "B")}
              >
                <Dropdown.Item
                  id="A"
                  textValue={`Select ${comp.firstScenario?.name || "Option A"}`}
                >
                  Select {comp.firstScenario?.name || "Option A"}
                </Dropdown.Item>
                <Dropdown.Item
                  id="B"
                  textValue={`Select ${comp.secondScenario?.name || "Option B"}`}
                >
                  Select {comp.secondScenario?.name || "Option B"}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>

          <AlertDialog>
            <Button aria-label="Delete comparison" size="sm" variant="danger">
              <Trash className="size-4" />
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
        </div>
      </Card.Footer>
    </Card>
  );
}
