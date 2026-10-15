import { Skeleton } from "@heroui/react";

export default function RootLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading page content"
      className="w-full pb-12 animate-in fade-in duration-200"
    >
      <span className="sr-only">Loading content, please wait...</span>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton animationType="shimmer" className="h-9 w-56 rounded-xl" />
          <Skeleton
            animationType="shimmer"
            className="h-4 w-80 max-w-full rounded-lg"
          />
        </div>
        <Skeleton animationType="shimmer" className="h-10 w-36 rounded-xl" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-separator/40 bg-surface/50 p-6 flex flex-col gap-4 shadow-xs"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton
                  animationType="shimmer"
                  className="h-5 w-3/4 rounded-lg"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-3.5 w-1/2 rounded-md"
                />
              </div>
              <Skeleton
                animationType="shimmer"
                className="h-6 w-14 rounded-full"
              />
            </div>

            <div className="space-y-2.5 py-3 border-y border-separator/30">
              <div className="flex justify-between">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-28 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-20 rounded"
                />
              </div>
              <div className="flex justify-between">
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-24 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-4 w-16 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1 mt-auto">
              <Skeleton
                animationType="shimmer"
                className="h-8 w-20 rounded-lg"
              />
              <Skeleton
                animationType="shimmer"
                className="h-8 w-24 rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
