"use client";

/** React & Next.js */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

/** UI Components (HeroUI) */
import {
  Button,
  Spinner,
  Form,
  Alert,
  CloseButton,
  Toast,
  toast,
  Surface,
} from "@heroui/react";

/** Form Handling & Validation */
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

/** Icons */
import {
  Calculator,
  Eraser,
  Save,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/** Local Actions & Components */
import {
  compareScenariosAction,
  saveComparisonAction,
  updateComparisonAction,
} from "./actions";
import ScenarioForm from "./ScenarioForm";
import ComparisonResults from "./ComparisonResults";

/** Types, State & Auth */
import { Prisma } from "@/generated/prisma/client";
import {
  CompareRequest,
  CompareRequestSchema,
  ComparisonResult,
  ComparisonResultSchema,
} from "@/types/comparison";
import { useSession } from "@/lib/auth-client";
import { useCompareStore } from "@/lib/store/useCompareStore";

const initialScenario = {
  name: "",
  housing_cost: 0,
  cost_period_months: 1,
  contract_months: 12,
  utilities: null,
  mandatory_fees: null,
  parking: null,
  transportation: null,
  upfront_costs: null,
  commute_minutes: null,
};

type ComparisonWithScenarios = Prisma.ComparisonGetPayload<{
  include: { firstScenario: true; secondScenario: true };
}>;

interface Props {
  initialComparison: ComparisonWithScenarios | null;
  comparisonId: string | null;
}

/**
 * Extracts and formats the results state from database comparison to the UI
 * @param comparison - The database comparison object
 * @returns Formatted comparison result or null
 */
function getInitialResultsState(
  comparison: ComparisonWithScenarios | null,
): ComparisonResult | null {
  if (!comparison || !comparison.resultSnapshot) return null;

  // Rehydrate (load) the results from the database using Zod
  try {
    return ComparisonResultSchema.parse(comparison.resultSnapshot);
  } catch {
    // Failed to parse result snapshot
    return null;
  }
}

/**
 * Set the form values if editing an existing comparison.
 * @param comparison - The database comparison object
 * @returns Initial values for the compare request form
 */
function getInitialFormValues(
  comparison: ComparisonWithScenarios | null,
): CompareRequest {
  if (!comparison) {
    return {
      scenario_a: { ...initialScenario },
      scenario_b: { ...initialScenario },
    };
  }

  return {
    scenario_a: {
      name: comparison.firstScenario.name,
      housing_cost: comparison.firstScenario.housingCost,
      cost_period_months: comparison.firstScenario.costPeriodMonths,
      contract_months: comparison.firstScenario.contractMonths,
      utilities: comparison.firstScenario.utilities,
      mandatory_fees: comparison.firstScenario.mandatoryFees,
      parking: comparison.firstScenario.parking,
      transportation: comparison.firstScenario.transportation,
      upfront_costs: comparison.firstScenario.upfrontCosts,
      commute_minutes: comparison.firstScenario.commuteMinutes,
    },
    scenario_b: {
      name: comparison.secondScenario.name,
      housing_cost: comparison.secondScenario.housingCost,
      cost_period_months: comparison.secondScenario.costPeriodMonths,
      contract_months: comparison.secondScenario.contractMonths,
      utilities: comparison.secondScenario.utilities,
      mandatory_fees: comparison.secondScenario.mandatoryFees,
      parking: comparison.secondScenario.parking,
      transportation: comparison.secondScenario.transportation,
      upfront_costs: comparison.secondScenario.upfrontCosts,
      commute_minutes: comparison.secondScenario.commuteMinutes,
    },
  };
}

/**
 * Main form component for comparing two housing scenarios
 */
export default function CompareForm({
  initialComparison,
  comparisonId,
}: Props) {
  /** Convert to boolean using !! to ensure strict boolean type for edit mode */
  const isEditing = !!comparisonId && !!initialComparison;

  const setFormData = useCompareStore((state) => state.setFormData);
  const setStoreResults = useCompareStore((state) => state.setResults);

  const [results, setResults] = useState<ComparisonResult | null>(() =>
    isEditing ? getInitialResultsState(initialComparison) : null,
  );

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: session } = useSession();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<CompareRequest>({
    resolver: zodResolver(CompareRequestSchema) as any,
    defaultValues: getInitialFormValues(isEditing ? initialComparison : null),
  });

  // Re-hydrate drafts from Zustand
  useEffect(() => {
    if (!isEditing) {
      const state = useCompareStore.getState();

      if (state.formData) reset(state.formData);
      if (state.results) setResults(state.results);
    }
  }, [isEditing, reset]); // Only run on mount or when mode changes

  // Sync form edits to Zustand drafts automatically
  useEffect(() => {
    if (isEditing) return;

    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((value) => {
      setFormData(value as CompareRequest);
    });

    return () => subscription.unsubscribe();
  }, [watch, setFormData, isEditing]);

  // Sync results to Zustand
  useEffect(() => {
    if (!isEditing) {
      setStoreResults(results);
    }
  }, [results, isEditing, setStoreResults]);

  const scenarioA = watch("scenario_a");
  const scenarioB = watch("scenario_b");

  const onSubmit: SubmitHandler<CompareRequest> = async (data) => {
    setServerError(null);
    setResults(null);
    setSaveSuccess(false);

    try {
      setLoading(true);
      const response = await compareScenariosAction(
        data.scenario_a,
        data.scenario_b,
      );

      if (response.success) {
        setResults(response.data as ComparisonResult);
        // Reset form with new data to clear the isDirty flag
        reset(data);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      let errorMessage = "Unable to connect to the server. Please try again.";

      if (!error?.message?.includes("fetch failed") && error?.message) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast.danger(errorMessage, {
        actionProps: {
          children: "Dismiss",
          onPress: () => toast.clear(),
          variant: "danger-soft",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    const emptyData = {
      scenario_a: { ...initialScenario },
      scenario_b: { ...initialScenario },
    };

    reset(emptyData);
    setFormData(emptyData);
    setResults(null);
    setStoreResults(null);
    setServerError(null);
    setSaveSuccess(false);

    if (comparisonId) {
      router.push("/compare");
    }
  }, [reset, setFormData, setStoreResults, comparisonId, router]);

  const handleSave = useCallback(async () => {
    if (!session || !results) return;
    setIsSaving(true);
    setServerError(null);
    setSaveSuccess(false);

    const formData = getValues();

    try {
      const response =
        isEditing && comparisonId
          ? await updateComparisonAction(
              comparisonId,
              formData.scenario_a,
              formData.scenario_b,
              results,
            )
          : await saveComparisonAction(
              formData.scenario_a,
              formData.scenario_b,
              results,
            );

      if (response.success) {
        setSaveSuccess(true);
        toast.success(
          isEditing
            ? "Comparison updated successfully!"
            : "Comparison saved successfully!",
        );
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast.danger(error.message || "Failed to save comparison.");
    } finally {
      setIsSaving(false);
    }
  }, [session, results, isEditing, comparisonId, getValues]);

  return (
    <div className="pb-12">
      <Toast.Provider />

      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
  {isEditing
    ? "Editing Saved Comparison"
    : "Housing Comparison"}
</h1>

          <p className="mt-2 text-default-500">
            {isEditing
              ? `Currently editing your comparison between ${scenarioA?.name || "Option A"} and ${scenarioB?.name || "Option B"}.`
              : "Compare two housing options side-by-side to understand the financial tradeoffs."}
          </p>
        </div>
        <NextLink href="/comparisons">
          <Button variant="tertiary">
            View Saved
            <ArrowRight className="size-4" />
          </Button>
        </NextLink>
      </div>

      {/* Error Alert Section */}
      <div className="mb-6">
        {serverError && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{serverError}</Alert.Title>
            </Alert.Content>
            <CloseButton onPress={() => setServerError(null)} />
          </Alert>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Forms */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Form
            className="w-full flex flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Scenario Forms Container */}
            <div className="grid gap-6 md:grid-cols-2 w-full">
              <ScenarioForm
                control={control}
                prefix="scenario_a"
                title="Option A"
              />
              <ScenarioForm
                control={control}
                prefix="scenario_b"
                title="Option B"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <Button
                className="font-semibold flex-1 md:flex-none shadow-sm"
                isPending={loading}
                size="lg"
                type="submit"
                variant="primary"
              >
                {({ isPending }) => (
                  <>
                    {isPending ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      <Calculator className="w-5 h-5" />
                    )}
                    {isPending
                      ? "Calculating..."
                      : isEditing
                        ? "Recalculate Results"
                        : "Compare Options"}
                  </>
                )}
              </Button>

              <Button
                className="font-semibold flex-1 md:flex-none shadow-sm"
                size="lg"
                type="button"
                variant="secondary"
                onPress={handleClear}
              >
                <Eraser className="w-5 h-5" />
                Clear
              </Button>
            </div>
          </Form>
        </div>

        {/* Right Column: Sticky Results Container */}
        <div className="col-span-12 lg:col-span-4 sticky top-24">
          <Surface
            className="w-full h-full min-h-[350px] flex flex-col rounded-2xl shadow-sm border border-separator/30 overflow-hidden p-0"
            variant="default"
          >
            {/* Results Content Body */}
            <div className="p-5 flex flex-col flex-1">
              {results ? (
                <>
                  <ComparisonResults
                    results={results}
                    scenarioA={scenarioA}
                    scenarioB={scenarioB}
                  />

                  {/* Save Actions Section */}
                  <div className="mt-auto pt-8">
                    {session ? (
                      <div className="flex flex-col gap-2">
                        {isDirty && (
                          <div className="text-xs text-warning-500 font-medium text-center mb-1">
                            You have unsaved changes. Please Recalculate Results
                            to save.
                          </div>
                        )}
                        <Button
                          className="w-full font-semibold shadow-sm"
                          isDisabled={saveSuccess || isDirty}
                          isPending={isSaving}
                          size="lg"
                          variant={isDirty ? "secondary" : "primary"}
                          onPress={handleSave}
                        >
                          {({ isPending }) => (
                            <>
                              {isPending ? (
                                <Spinner color="current" size="sm" />
                              ) : saveSuccess ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <Save className="w-5 h-5" />
                              )}
                              {isPending
                                ? "Saving..."
                                : saveSuccess
                                  ? "Saved Successfully!"
                                  : isDirty
                                    ? "Recalculate to Save"
                                    : isEditing
                                      ? "Save Changes"
                                      : "Save Comparison"}
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Alert className="w-full" status="warning">
                        Sign in to save this comparison.
                      </Alert>
                    )}
                  </div>
                </>
              ) : (
                /* Empty Results State */
                <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-12">
                  <div className="w-16 h-16 bg-content2 rounded-full flex items-center justify-center mb-2">
                    <Calculator className="w-8 h-8 text-default-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
  Compare Housing Options
</h3>

<p className="text-default-500 text-sm">
  Complete the required fields for both options and run a
  comparison to view:
</p>

<ul className="mt-3 text-sm text-default-500 text-left list-disc pl-5">
  <li>Monthly Cost</li>
  <li>Full-Term Cost</li>
  <li>Category Differences</li>
  <li>Key Tradeoffs</li>
</ul>
                  </div>
                </div>
              )}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
