import { Card, Skeleton } from "@heroui/react";

export default function SavedComparisonsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading saved comparisons"
      className="pb-12 animate-in fade-in duration-200"
    >
      <span className="sr-only">Loading your saved comparisons...</span>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton animationType="shimmer" className="h-4 w-16 rounded" />
        <Skeleton animationType="shimmer" className="h-4 w-32 rounded" />
      </div>

      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton animationType="shimmer" className="h-10 w-60 rounded-xl" />
      </div>

      {/* Grid of ComparisonCard Skeletons */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-full min-w-0 flex flex-col p-4 sm:p-5">
            {/* Header: Option A vs Option B & Date */}
            <div className="flex flex-col gap-1.5 pb-3 border-b border-separator/20">
              <Skeleton
                animationType="shimmer"
                className="h-5 w-3/4 rounded-lg"
              />
              <Skeleton
                animationType="shimmer"
                className="h-3.5 w-32 rounded"
              />
            </div>

            {/* Content: 2 scenario cost comparison rows */}
            <div className="flex flex-col flex-1 py-4 gap-3">
              <div className="flex items-start justify-between gap-3">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-36 rounded"
                />
                <div className="flex flex-col items-end gap-1">
                  <Skeleton
                    animationType="shimmer"
                    className="h-5 w-20 rounded"
                  />
                  <Skeleton
                    animationType="shimmer"
                    className="h-3 w-14 rounded"
                  />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-40 rounded"
                />
                <div className="flex flex-col items-end gap-1">
                  <Skeleton
                    animationType="shimmer"
                    className="h-5 w-20 rounded"
                  />
                  <Skeleton
                    animationType="shimmer"
                    className="h-3 w-14 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Footer: Open, Add to Plan, Delete action button skeletons */}
            <div className="flex items-center justify-end gap-2 pt-3 mt-auto border-t border-separator/20">
              <Skeleton
                animationType="shimmer"
                className="h-8 w-18 rounded-lg"
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
