"use client";

/** React & Next.js */
import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

/** UI Components */
import { Button, Dropdown, Toast, toast, AlertDialog } from "@heroui/react";

import { ExternalLink, RefreshCw, Trash } from "lucide-react";

/** Local Actions */
import { deleteFinancialPlanAction } from "./actions";

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

      router.push("/plan");
      router.refresh();
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
        <NextLink
          className="button button--secondary button--sm"
          href={`/compare?id=${comparisonId}`}
        >
          <ExternalLink className="size-4" />
          View Comparison
        </NextLink>

        <Dropdown>
          <Button size="sm" variant="secondary">
            <RefreshCw className="size-4" />
            Switch Option
          </Button>

          <Dropdown.Popover>
            <Dropdown.Menu onAction={(key) => handleSwitch(key as "A" | "B")}>
              <Dropdown.Item
                id="A"
                isDisabled={viewingScenario === "A"}
                textValue={scenarioAName}
              >
                {scenarioAName}
              </Dropdown.Item>

              <Dropdown.Item
                id="B"
                isDisabled={viewingScenario === "B"}
                textValue={scenarioBName}
              >
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
