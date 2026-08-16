"use client";

import { useEffect, useState } from "react";
import { Button, Card, Spinner, Alert } from "@heroui/react";
import { useRouter } from "next/navigation";

import {
  getSavedComparisonsAction,
  deleteComparisonAction,
} from "../compare/actions";

export default function SavedComparisonsPage() {
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const loadComparisons = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await getSavedComparisonsAction();

      if (response.success) {
        setComparisons(response.data ?? []);
      } else {
        setError(
          response.error ??
            "Unable to load saved comparisons.",
        );
      }
    } catch {
      setError(
        "Unable to load saved comparisons.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparisons();
  }, []);

  const handleOpen = (
  comparisonId: string,
) => {
  router.push(
    `/compare?comparisonId=${comparisonId}`,
  );
};
  const handleDelete = async (
    comparisonId: string,
  ) => {
    const confirmed = window.confirm(
      "Delete this saved comparison?",
    );

    if (!confirmed) {
      return;
    }

    const response =
      await deleteComparisonAction(
        comparisonId,
      );

    if (response.success) {
      setComparisons((prev) =>
        prev.filter(
          (item) => item.id !== comparisonId,
        ),
      );
    } else {
      setError(
        response.error ??
          "Unable to delete comparison.",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-4xl font-bold">
        Saved Comparisons
      </h1>

      {error && (
        <Alert color="danger">
          {error}
        </Alert>
      )}

      {comparisons.length === 0 ? (
        <Card className="p-6">
          <p>
            No saved comparisons found.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {comparisons.map((comparison) => (
            <Card
              key={comparison.id}
              className="p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {comparison.firstScenario?.name}
                    {" vs "}
                    {comparison.secondScenario?.name}
                  </h2>

                  <p className="text-default-500">
                    Saved on{" "}
                    {new Date(
                      comparison.createdAt,
                    ).toLocaleDateString()}
                  </p>

                  <p className="mt-2">
                    Monthly Difference: $
                    {comparison.monthlyDifference?.toLocaleString() ??
                      0}
                  </p>

                  <p>
                    Lower Cost Option:{" "}
                    {comparison.lowerMonthlyCostScenario ??
                      "Tie"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onPress={() =>
                        handleOpen(comparison.id)
                    }
                  >
                    Open
                </Button>

                  <Button
                    variant="danger-soft"
                    onPress={() =>
                      handleDelete(
                        comparison.id,
                      )
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}