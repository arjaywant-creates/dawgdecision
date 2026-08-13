"use client";

import { useEffect, useState } from "react";
import { Button, Spinner, Form, Alert, CloseButton } from "@heroui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Eraser } from "lucide-react";

import ScenarioForm from "@/components/compare/ScenarioForm";
import ComparisonResults from "@/components/compare/ComparisonResults";

import {
  CompareRequest,
  CompareRequestSchema,
  ComparisonResult,
} from "@/types/comparison";

import { compareScenariosAction } from "./actions";
import { useCompareStore } from "@/lib/store/useCompareStore";

const initialScenario = {
  name: "",
  monthly_income: 0,
  rent: 0,
  utilities: 0,
  transportation: 0,
  mandatory_fees: 0,
  other_expenses: 0,
  lease_months: 12,
};

export default function ComparePage() {
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const setFormData = useCompareStore((state) => state.setFormData);

  const { control, handleSubmit, watch, reset } = useForm<CompareRequest>({
    resolver: zodResolver(CompareRequestSchema) as any,
    defaultValues: {
      scenario_a: { ...initialScenario },
      scenario_b: { ...initialScenario },
    },
  });

  // Load saved data from Zustand
  useEffect(() => {
    const state = useCompareStore.getState();
    if (state.formData) {
      reset(state.formData);
    }
  }, [reset]);

  // Save changes to Zustand on form change
  useEffect(() => {
    const subscription = watch((value) => {
      setFormData(value as CompareRequest);
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  const onSubmit: SubmitHandler<CompareRequest> = async (data) => {
    setServerError(null);
    setResults(null);
    
    try {
      setLoading(true);

      const response = await compareScenariosAction(
        data.scenario_a,
        data.scenario_b
      );

      if (response.success) {
        setResults(response.data as ComparisonResult);
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      if (error?.message?.includes("fetch failed")) {
        setServerError("Unable to connect to the server. Please try again.");
      } else {
        setServerError(
          error?.message || "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const emptyForm = {
      scenario_a: { ...initialScenario },
      scenario_b: { ...initialScenario },
    };
    reset(emptyForm);
    setFormData(emptyForm);
    setResults(null);
    setServerError(null);
  };


  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Housing Comparison
        </h1>

        <p className="mt-2 text-default-500">
          Compare two housing options and
          understand their financial tradeoffs.
        </p>
      </div>

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

      <Form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">
        <div className="grid gap-6 lg:grid-cols-2 w-full">
          <ScenarioForm
            title="Scenario A"
            prefix="scenario_a"
            control={control}
          />

          <ScenarioForm
            title="Scenario B"
            prefix="scenario_b"
            control={control}
          />
        </div>

        <div className="mt-8 flex gap-4">
          <Button
            type="submit"
            isPending={loading}
            variant="primary"
            size="lg"
            className="font-semibold w-fit"
          >
            {({ isPending }) => (
              <>
                {isPending ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <Calculator className="w-5 h-5" />
                )}
                {isPending ? "Comparing..." : "Compare Housing Options"}
              </>
            )}
          </Button>

          <Button
            type="button"
            onPress={handleClear}
            variant="secondary"
            size="lg"
            className="font-semibold w-fit"
          >
            <Eraser className="w-5 h-5" />
            Clear All
          </Button>
        </div>
      </Form>

      {results && (
        <ComparisonResults
          results={results}
        />
      )}
    </div>
  );
}