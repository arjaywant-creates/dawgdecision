import { Card, Skeleton } from "@heroui/react";

export default function DashboardLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading dashboard"
      className="pb-12 animate-in fade-in duration-200"
    >
      <span className="sr-only">
        Loading your dashboard and recent comparisons...
      </span>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton animationType="shimmer" className="h-10 w-44 rounded-xl" />
          <Skeleton animationType="shimmer" className="h-4 w-52 rounded-md" />
        </div>
        <Skeleton animationType="shimmer" className="h-10 w-36 rounded-xl" />
      </div>

      {/* Stats Grid Section: 3 StatCards */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col gap-2">
              <Skeleton animationType="shimmer" className="h-4 w-28 rounded" />
              <Skeleton
                animationType="shimmer"
                className="h-9 w-20 rounded-lg"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Comparisons Section */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <Skeleton animationType="shimmer" className="h-7 w-52 rounded-lg" />
          <Skeleton animationType="shimmer" className="h-8 w-24 rounded-lg" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="h-full min-w-0 flex flex-col p-4 sm:p-5">
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

              <div className="flex flex-col flex-1 py-4 gap-3">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton
                    animationType="shimmer"
                    className="h-4 w-36 rounded"
                  />
                  <Skeleton
                    animationType="shimmer"
                    className="h-5 w-20 rounded"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <Skeleton
                    animationType="shimmer"
                    className="h-4 w-40 rounded"
                  />
                  <Skeleton
                    animationType="shimmer"
                    className="h-5 w-20 rounded"
                  />
                </div>
              </div>

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
    </div>
  );
}
