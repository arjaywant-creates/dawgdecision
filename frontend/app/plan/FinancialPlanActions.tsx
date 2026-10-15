"use client";

/** React & Next.js */
import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

/** UI Components */
import { Button, Dropdown, AlertDialog, Spinner } from "@heroui/react";

import { ExternalLink, RefreshCw, Trash } from "lucide-react";

/** Local Actions */
import { deleteFinancialPlanAction } from "./actions";

import { toast } from "@/lib/toast";

interface Props {
  planId: string;
  comparisonId: string;
  scenarioAName: string;
  scenarioBName: string;

  viewingScenario: "A" | "B";
  onSwitch: (scenario: "A" | "B") => void;
}

/**
 * Client-side controls for a Financial Plan.
 *
 * Switching options changes only what the user is viewing.
 * It does NOT modify the saved Financial Plan.
 */
export function FinancialPlanActions({
  planId,
  comparisonId,
  scenarioAName,
  scenarioBName,
  viewingScenario,
  onSwitch,
}: Props) {
  const router = useRouter();

  const [isRemoving, setIsRemoving] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleSwitch = (key: "A" | "B") => {
    onSwitch(key);

    toast.success(`Viewing ${key === "A" ? scenarioAName : scenarioBName}`);
  };

  const handleRemove = async () => {
    setIsRemoving(true);

    try {
      const result = await deleteFinancialPlanAction(planId);

      if (!result.success) {
        throw new Error(result.error || "Failed to remove");
      }

      toast.success("Removed from Financial Plan");
      setIsAlertOpen(false);
      router.push("/plan");
      router.refresh();
    } catch (e: any) {
      toast.danger(e.message || "Failed to remove");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <NextLink
        aria-label="View comparison"
        className="button button--tertiary"
        href={`/compare?id=${comparisonId}`}
      >
        <ExternalLink className="size-4" />
        View Comparison
      </NextLink>

      <Dropdown>
        <Button variant="tertiary">
          <RefreshCw className="size-4" />
          Switch Option
        </Button>

        <Dropdown.Popover className="min-w-[280px] sm:min-w-[320px] p-1">
          <div className="px-3 pt-2 pb-1.5 text-xs font-semibold text-default-500">
            Switch Displayed Option
          </div>
          <Dropdown.Menu onAction={(key) => handleSwitch(key as "A" | "B")}>
            <Dropdown.Item
              id="A"
              isDisabled={viewingScenario === "A"}
              textValue={scenarioAName}
            >
              <div className="flex flex-col gap-0.5 py-1 w-full text-left">
                <span className="text-sm font-medium text-foreground leading-snug">
                  {scenarioAName}
                </span>
                <span className="text-xs text-default-500">
                  {viewingScenario === "A"
                    ? "Currently viewing"
                    : "Switch to this option"}
                </span>
              </div>
            </Dropdown.Item>

            <Dropdown.Item
              id="B"
              isDisabled={viewingScenario === "B"}
              textValue={scenarioBName}
            >
              <div className="flex flex-col gap-0.5 py-1 w-full text-left">
                <span className="text-sm font-medium text-foreground leading-snug">
                  {scenarioBName}
                </span>
                <span className="text-xs text-default-500">
                  {viewingScenario === "B"
                    ? "Currently viewing"
                    : "Switch to this option"}
                </span>
              </div>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <AlertDialog isOpen={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <Button
          aria-label="Remove from financial plan"
          className="min-w-0 px-2.5 text-xs gap-1.5"
          isDisabled={isRemoving}
          size="sm"
          variant="danger"
          onPress={() => setIsAlertOpen(true)}
        >
          <Trash className="size-3.5" />
          Remove
        </Button>

        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger isDisabled={isRemoving} />

              <AlertDialog.Header>
                <AlertDialog.Icon status="danger" />

                <AlertDialog.Heading>
                  Remove from Financial Plan?
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body>
                <p>
                  This will remove this housing selection from your Financial
                  Plan. Your saved comparison will not be deleted.
                </p>
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button isDisabled={isRemoving} slot="close" variant="tertiary">
                  Cancel
                </Button>

                <Button
                  isDisabled={isRemoving}
                  isPending={isRemoving}
                  variant="danger"
                  onPress={handleRemove}
                >
                  {({ isPending }) => (
                    <>
                      {isPending && <Spinner color="current" size="sm" />}
                      {isPending ? "Removing..." : "Remove"}
                    </>
                  )}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
