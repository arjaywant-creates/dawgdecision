"use client";

/** React & Next.js */
import { useState } from "react";
import NextLink from "next/link";

/** UI Components (HeroUI & Lucide Icons) */
import { Button, Dropdown, Toast, toast, AlertDialog } from "@heroui/react";
import { ExternalLink, RefreshCw, Trash } from "lucide-react";

/** Local Actions */
import {
  deleteFinancialPlanAction,
  setFinancialPlanHousingAction,
} from "./actions";

interface Props {
  planId: string;
  comparisonId: string;
  scenarioAName: string;
  scenarioBName: string;
}

/**
 * Client-side component providing controls for the Financial Plan:
 * switching the selected option, viewing the comparison, and removing the plan.
 */
export function FinancialPlanActions({
  planId,
  comparisonId,
  scenarioAName,
  scenarioBName,
}: Props) {
  const [isSwitching, setIsSwitching] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSwitch = async (key: "A" | "B") => {
    setIsSwitching(true);
    try {
      await setFinancialPlanHousingAction(comparisonId, key);
      toast.success("Switched option successfully");
    } catch (e: any) {
      toast.danger(e.message || "Failed to switch option");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await deleteFinancialPlanAction(planId);
      toast.success("Removed from Financial Plan");
    } catch (e: any) {
      toast.danger(e.message || "Failed to remove");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Toast.Provider />
      <div className="flex gap-2 items-center flex-wrap mt-4">
        <NextLink href={`/compare?id=${comparisonId}`}>
          <Button size="sm" variant="secondary">
            <ExternalLink className="size-4" />
            View Comparison
          </Button>
        </NextLink>

        <Dropdown>
          <Button isPending={isSwitching} size="sm" variant="secondary">
            <RefreshCw className="size-4" />
            Switch Option
          </Button>
          <Dropdown.Popover>
            <Dropdown.Menu onAction={(key) => handleSwitch(key as "A" | "B")}>
              <Dropdown.Item id="A" textValue={scenarioAName}>
                {scenarioAName}
              </Dropdown.Item>
              <Dropdown.Item id="B" textValue={scenarioBName}>
                {scenarioBName}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <AlertDialog>
          <Button aria-label="Remove" size="sm" variant="danger">
            <Trash className="size-4" />
            Remove
          </Button>
          <AlertDialog.Backdrop>
            <AlertDialog.Container>
              <AlertDialog.Dialog className="sm:max-w-[400px]">
                <AlertDialog.CloseTrigger />
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
                  <Button slot="close" variant="tertiary">
                    Cancel
                  </Button>
                  <Button
                    isPending={isRemoving}
                    slot="close"
                    variant="danger"
                    onPress={handleRemove}
                  >
                    Remove
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Dialog>
            </AlertDialog.Container>
          </AlertDialog.Backdrop>
        </AlertDialog>
      </div>
    </>
  );
}
