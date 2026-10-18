"use client";

/** React & Next.js */
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";

/** UI Components (HeroUI) */
import {
  Button,
  Spinner,
  Skeleton,
  Form,
  Alert,
  CloseButton,
  Breadcrumbs,
  Surface,
  Tabs,
} from "@heroui/react";
import { OutlineSurface } from "@/components/OutlineSurface";
import { clsx } from "clsx";

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
  Info,
} from "lucide-react";

/** Local Actions & Components */
import {
  compareScenariosAction,
  saveComparisonAction,
  updateComparisonAction,
} from "./actions";
import ScenarioForm from "./ScenarioForm";
import ComparisonResults from "./ComparisonResults";
import HousingLocationMap from "./HousingLocationMap";

import { SourcedHousingOption } from "@/types/sourced-housing";
import SourcedHousingSelector from "@/components/SourcedHousingSelector";

/** Types, State & Auth */
import { Prisma } from "@/generated/prisma/client";
import {
  CompareRequest,
  CompareRequestSchema,
  ComparisonResult,
  ComparisonResultSchema,
  Scenario,
} from "@/types/comparison";
import { useSession } from "@/lib/auth-client";
import { useCompareStore } from "@/lib/store/useCompareStore";

import { toast } from "@/lib/toast";

import posthog from "posthog-js";

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
  sourcedOptions: SourcedHousingOption[];
  apiError?: boolean;
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
  sourcedOptions,
  apiError,
}: Props) {
  const [activeComparisonId, setActiveComparisonId] = useState<string | null>(
    comparisonId ?? null,
  );

  useEffect(() => {
    setActiveComparisonId(comparisonId ?? null);
  }, [comparisonId]);

  /** True if we have an active comparison ID being edited or newly saved */
  const isEditing = Boolean(activeComparisonId);

  const setFormData = useCompareStore((state) => state.setFormData);
  const setStoreResults = useCompareStore((state) => state.setResults);

  // Selected housing IDs, isolate edit mode from Zustand
  const storeHousingIdA = useCompareStore((state) => state.selectedHousingIdA);
  const storeHousingIdB = useCompareStore((state) => state.selectedHousingIdB);
  const storeSetSelectedHousingIdA = useCompareStore(
    (state) => state.setSelectedHousingIdA,
  );
  const storeSetSelectedHousingIdB = useCompareStore(
    (state) => state.setSelectedHousingIdB,
  );

  const [editHousingIdA, setEditHousingIdA] = useState("");
  const [editHousingIdB, setEditHousingIdB] = useState("");

  const selectedHousingIdA = isEditing ? editHousingIdA : storeHousingIdA;
  const selectedHousingIdB = isEditing ? editHousingIdB : storeHousingIdB;
  const setSelectedHousingIdA = isEditing
    ? setEditHousingIdA
    : storeSetSelectedHousingIdA;
  const setSelectedHousingIdB = isEditing
    ? setEditHousingIdB
    : storeSetSelectedHousingIdB;

  const clearStore = useCompareStore((state) => state.clearStore);

  const [results, setResults] = useState<ComparisonResult | null>(() =>
    isEditing ? getInitialResultsState(initialComparison) : null,
  );

  const [scenarioAOriginalValues, setScenarioAOriginalValues] =
    useState<Partial<Scenario> | null>(null);

  const [scenarioBOriginalValues, setScenarioBOriginalValues] =
    useState<Partial<Scenario> | null>(null);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: session } = useSession();
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<CompareRequest>({
    resolver: zodResolver(CompareRequestSchema) as any,
    defaultValues: getInitialFormValues(isEditing ? initialComparison : null),
  });

  const mapSourcedHousingToScenario = (housing: SourcedHousingOption) => ({
    name: `${housing.property_name} - ${housing.configuration}`,
    housing_cost: housing.housing_cost ?? ("" as any),
    cost_period_months: housing.cost_period_months ?? ("" as any),
    contract_months:
      housing.contract_months ?? (housing.category === "on_campus" ? 8 : 12),
    utilities: housing.utilities ?? ("" as any),
    mandatory_fees: housing.mandatory_fees ?? ("" as any),
    parking: housing.parking ?? ("" as any),
    transportation: housing.transportation ?? ("" as any),
    upfront_costs: housing.upfront_costs ?? ("" as any),
    commute_minutes: housing.commute_minutes ?? ("" as any),
  });

  const populateScenario = (
    prefix: "scenario_a" | "scenario_b",
    housing: SourcedHousingOption,
  ) => {
    const newScenarioData = mapSourcedHousingToScenario(housing);

    if (prefix === "scenario_a") {
      setScenarioAOriginalValues(newScenarioData);
    } else {
      setScenarioBOriginalValues(newScenarioData);
    }

    setValue(prefix, newScenarioData, {
      shouldDirty: true,
    });
  };

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
    if (isEditing) {
      // Clear store when entering edit mode
      clearStore();

      return;
    }

    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((value) => {
      setFormData(value as CompareRequest);
    });

    return () => subscription.unsubscribe();
  }, [watch, setFormData, isEditing, clearStore]);

  // Restore sourced housing selections when editing a saved comparison.
  // Saved scenarios persist their populated values, but not the Zustand selector IDs,
  // so match the saved scenario name back to the current sourced option list.
  useEffect(() => {
    if (!isEditing || !initialComparison) return;

    const scenarioAName = initialComparison.firstScenario.name;
    const scenarioBName = initialComparison.secondScenario.name;

    const matchingOptionA = sourcedOptions.find(
      (option) =>
        `${option.property_name} - ${option.configuration}` === scenarioAName,
    );

    const matchingOptionB = sourcedOptions.find(
      (option) =>
        `${option.property_name} - ${option.configuration}` === scenarioBName,
    );

    if (matchingOptionA) {
      setSelectedHousingIdA(matchingOptionA.id);
      setScenarioAOriginalValues(mapSourcedHousingToScenario(matchingOptionA));
    }

    if (matchingOptionB) {
      setSelectedHousingIdB(matchingOptionB.id);
      setScenarioBOriginalValues(mapSourcedHousingToScenario(matchingOptionB));
    }
  }, [
    isEditing,
    initialComparison,
    sourcedOptions,
    setSelectedHousingIdA,
    setSelectedHousingIdB,
  ]);

  // Sync results to Zustand
  useEffect(() => {
    if (!isEditing) {
      setStoreResults(results);
    }
  }, [results, isEditing, setStoreResults]);

  const scenarioA = watch("scenario_a");
  const scenarioB = watch("scenario_b");

  const selectedOptionA =
    sourcedOptions.find((o) => o.id === selectedHousingIdA) || null;
  const selectedOptionB =
    sourcedOptions.find((o) => o.id === selectedHousingIdB) || null;

  const onSubmit: SubmitHandler<CompareRequest> = async (data) => {
    setServerError(null);
    setResults(null);
    setSaveSuccess(false);

    // Track comparison started event with PostHog
    posthog.capture("comparison_started", {
      scenario_a_name: data.scenario_a.name,
      scenario_b_name: data.scenario_b.name,
    });

    try {
      setLoading(true);
      const response = await compareScenariosAction(
        data.scenario_a,
        data.scenario_b,
      );

      if (response.success) {
        // Track comparison completed event with PostHog
        posthog.capture("comparison_completed", {
          scenario_a_name: data.scenario_a.name,
          scenario_b_name: data.scenario_b.name,
          success: true,
        });
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
      toast.danger(errorMessage);
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
    setResults(null);
    setServerError(null);
    setSaveSuccess(false);
    clearStore();
    setSelectedHousingIdA("");
    setSelectedHousingIdB("");
    const hadId = Boolean(activeComparisonId);

    setActiveComparisonId(null);

    if (hadId) {
      router.push("/compare");
    }
  }, [
    reset,
    clearStore,
    activeComparisonId,
    router,
    setSelectedHousingIdA,
    setSelectedHousingIdB,
  ]);

  const handleSave = useCallback(async () => {
    if (!session || !results) return;
    setIsSaving(true);
    setServerError(null);
    setSaveSuccess(false);

    const formData = getValues();

    try {
      const response =
        isEditing && activeComparisonId
          ? await updateComparisonAction(
              activeComparisonId,
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
        if (!isEditing && response.data?.id) {
          setActiveComparisonId(response.data.id);
          router.replace(`/compare?id=${response.data.id}`, { scroll: false });
        }
        // Track comparison saved event with PostHog
        posthog.capture("comparison_saved", {
          scenario_a_name: formData.scenario_a.name,
          scenario_b_name: formData.scenario_b.name,
          is_editing: isEditing,
        });
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
  }, [session, results, isEditing, activeComparisonId, getValues]);

  return (
    <div className="pb-12">
      <Breadcrumbs className="mb-4">
        <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
        <Breadcrumbs.Item>
          {isEditing ? "Edit Comparison" : "New Comparison"}
        </Breadcrumbs.Item>
      </Breadcrumbs>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            {isEditing ? "Editing Saved Comparison" : "Housing Comparison"}
          </h1>
          <p className="mt-2 text-default-500">
            {isEditing
              ? `Currently editing your comparison between ${scenarioA?.name || "Option A"} and ${scenarioB?.name || "Option B"}.`
              : "Compare two housing options side-by-side to understand the financial tradeoffs."}
          </p>
        </div>
        <NextLink className="button button--tertiary" href="/comparisons">
          View Saved
          <ArrowRight className="size-4" />
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
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <Form
            className="w-full flex flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Mobile Tab Selector */}
            <div className="md:hidden mb-6 w-full">
              <Tabs
                className="w-full"
                selectedKey={activeTab}
                onSelectionChange={(k) => setActiveTab(k as "A" | "B")}
              >
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Options" className="w-full">
                    <Tabs.Tab id="A">
                      Option A
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="B">
                      Option B
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
              </Tabs>
            </div>

            {/* Scenario Forms Container */}
            <div className="grid gap-6 md:grid-cols-2 w-full min-w-0">
              <div
                className={
                  activeTab === "A"
                    ? "block min-w-0"
                    : "hidden md:block min-w-0"
                }
              >
                <ScenarioForm
                  control={control}
                  prefix="scenario_a"
                  selector={
                    <SourcedHousingSelector
                      apiError={apiError}
                      options={sourcedOptions}
                      selectedId={selectedHousingIdA}
                      onSelect={(option) => {
                        setSelectedHousingIdA(option?.id || "");
                        if (option) {
                          // Track housing option selection with PostHog
                          posthog.capture("housing_option_selected", {
                            property_name: option.property_name,
                            category: option.category,
                          });
                          populateScenario("scenario_a", option);
                        }
                      }}
                    />
                  }
                  sourcedValues={scenarioAOriginalValues}
                  title="Option A"
                />
              </div>

              <div
                className={
                  activeTab === "B"
                    ? "block min-w-0"
                    : "hidden md:block min-w-0"
                }
              >
                <ScenarioForm
                  control={control}
                  prefix="scenario_b"
                  selector={
                    <SourcedHousingSelector
                      apiError={apiError}
                      options={sourcedOptions}
                      selectedId={selectedHousingIdB}
                      onSelect={(option) => {
                        setSelectedHousingIdB(option?.id || "");
                        if (option) {
                          // Track housing option selection with PostHog
                          posthog.capture("housing_option_selected", {
                            property_name: option.property_name,
                            category: option.category,
                          });
                          populateScenario("scenario_b", option);
                        }
                      }}
                    />
                  }
                  sourcedValues={scenarioBOriginalValues}
                  title="Option B"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                className="font-semibold w-full sm:w-auto md:w-max shadow-sm px-8"
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
                className="font-semibold w-full sm:w-auto md:w-max shadow-sm px-8"
                isDisabled={loading}
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

        {/* Right Column: Results Container */}
        <div
          className={clsx(
            "lg:col-span-4 min-w-0",
            !results && !loading && "hidden lg:block",
          )}
        >
          <Surface
            className="w-full h-full min-h-[350px] flex flex-col rounded-2xl shadow-sm border border-separator/30 overflow-hidden p-0"
            variant="default"
          >
            {/* Results Content Body */}
            <div className="p-5 flex flex-col flex-1">
              {loading ? (
                <div
                  aria-busy="true"
                  aria-live="polite"
                  className="flex flex-col flex-1 gap-5 py-4 animate-in fade-in duration-200"
                >
                  <div className="flex flex-col items-center text-center pb-4 border-b border-separator/30">
                    <h3 className="inline-flex items-center gap-2 px-3 py-1.5 text-lg font-bold text-foreground">
                      <Spinner color="current" size="sm" />
                      Analyzing Scenarios...
                    </h3>
                    <p className="text-xs text-default-500 mt-1 max-w-[280px]">
                      Calculating true monthly costs, fee schedules, and
                      financial tradeoffs between options.
                    </p>
                  </div>

                  {/* Shimmering cards */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-separator/30 bg-default-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton
                          animationType="shimmer"
                          className="h-4 w-32 rounded"
                        />
                        <Skeleton
                          animationType="shimmer"
                          className="h-4 w-16 rounded"
                        />
                      </div>
                      <div className="space-y-2">
                        <Skeleton
                          animationType="shimmer"
                          className="h-7 w-full rounded-lg"
                        />
                        <Skeleton
                          animationType="shimmer"
                          className="h-7 w-full rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-separator/30 bg-default-50/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton
                          animationType="shimmer"
                          className="h-4 w-36 rounded"
                        />
                        <Skeleton
                          animationType="shimmer"
                          className="h-4 w-20 rounded"
                        />
                      </div>
                      <div className="space-y-2">
                        <Skeleton
                          animationType="shimmer"
                          className="h-7 w-full rounded-lg"
                        />
                        <Skeleton
                          animationType="shimmer"
                          className="h-7 w-full rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-separator/20 bg-default-50/30 space-y-2">
                      <Skeleton
                        animationType="shimmer"
                        className="h-3.5 w-28 rounded"
                      />
                      <Skeleton
                        animationType="shimmer"
                        className="h-3 w-full rounded"
                      />
                      <Skeleton
                        animationType="shimmer"
                        className="h-3 w-4/5 rounded"
                      />
                    </div>
                  </div>
                </div>
              ) : results ? (
                <>
                  <ComparisonResults
                    isDirty={isDirty}
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
                          isDisabled={saveSuccess || isDirty || isSaving}
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
                      <OutlineSurface className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4">
                        <div className="flex items-center gap-2">
                          <Info className="size-4 text-default-500 shrink-0" />
                          <span className="text-sm font-medium text-default-700">
                            Sign in to save this comparison.
                          </span>
                        </div>
                        <NextLink
                          className="button button--outline button--sm w-full sm:w-auto border-default-200"
                          href="/login"
                          onClick={() =>
                            posthog.capture("compare_login_prompt_clicked")
                          }
                        >
                          Log In
                        </NextLink>
                      </OutlineSurface>
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

      {/* Interactive Map */}
      <div className="mt-8 w-full">
        <HousingLocationMap
          optionA={selectedOptionA}
          optionB={selectedOptionB}
          scenarioAName={scenarioA?.name}
          scenarioBName={scenarioB?.name}
        />
      </div>
    </div>
  );
}
