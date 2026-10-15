import { Card, Skeleton } from "@heroui/react";

export default function FinancialPlansLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading saved financial plans"
      className="pb-12 animate-in fade-in duration-200"
    >
      <span className="sr-only">Loading your saved financial plans...</span>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton animationType="shimmer" className="h-4 w-16 rounded" />
        <Skeleton animationType="shimmer" className="h-4 w-24 rounded" />
      </div>

      {/* Header Section */}
      <div className="mb-2">
        <Skeleton animationType="shimmer" className="h-10 w-64 rounded-xl" />
      </div>
      <Skeleton animationType="shimmer" className="h-4 w-72 rounded-md mb-8" />

      {/* Grid of FinancialPlanCard Skeletons */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-full min-w-0 flex flex-col p-4 sm:p-5">
            {/* Header: Housing Title & Date */}
            <div className="flex flex-col gap-1 pb-3 border-b border-separator/20">
              <Skeleton
                animationType="shimmer"
                className="h-5 w-2/3 rounded-lg"
              />
              <Skeleton
                animationType="shimmer"
                className="h-3.5 w-28 rounded"
              />
            </div>

            {/* Content: True Monthly Cost, Upfront, Full-Term */}
            <div className="flex flex-col flex-1 py-4 gap-3">
              <div className="flex items-baseline justify-between">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-32 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-6 w-24 rounded"
                />
              </div>

              <div className="flex items-baseline justify-between">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-24 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-5 w-20 rounded"
                />
              </div>

              <div className="flex items-baseline justify-between">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-36 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-5 w-24 rounded"
                />
              </div>

              {/* Impact Callout Line */}
              <div className="mt-auto pt-3 border-t border-separator/20">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-5/6 rounded"
                />
              </div>
            </div>

            {/* Footer: View Plan, Comparison, Delete */}
            <div className="flex items-center justify-end gap-2 pt-3 mt-auto border-t border-separator/20">
              <Skeleton
                animationType="shimmer"
                className="h-8 w-24 rounded-lg"
              />
              <Skeleton
                animationType="shimmer"
                className="h-8 w-28 rounded-lg"
              />
              <Skeleton
                animationType="shimmer"
                className="h-8 w-8 rounded-lg"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
