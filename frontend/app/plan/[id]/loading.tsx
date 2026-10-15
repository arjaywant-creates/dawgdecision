import { Card, Skeleton } from "@heroui/react";
import { Home, TrendingUp } from "lucide-react";

export default function FinancialPlanDetailLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading financial plan details"
      className="pb-12 space-y-6 animate-in fade-in duration-200"
    >
      <span className="sr-only">
        Loading financial plan details and computing decision tradeoffs...
      </span>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-2">
        <Skeleton animationType="shimmer" className="h-4 w-16 rounded" />
        <Skeleton animationType="shimmer" className="h-4 w-20 rounded" />
        <Skeleton animationType="shimmer" className="h-4 w-32 rounded" />
      </div>

      {/* Header Row */}
      <div className="space-y-3 pb-4 border-b border-default-200/60">
        <div className="space-y-2">
          {/* Plan Housing Name Skeleton */}
          <Skeleton
            animationType="shimmer"
            className="h-9 w-72 sm:w-96 rounded-xl"
          />
          {/* Saved date skeleton */}
          <Skeleton animationType="shimmer" className="h-4 w-36 rounded-md" />
        </div>

        {/* Action Controls Skeleton Row */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Skeleton animationType="shimmer" className="h-9 w-36 rounded-lg" />
          <Skeleton animationType="shimmer" className="h-9 w-32 rounded-lg" />
          <Skeleton animationType="shimmer" className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      {/* Housing Summary Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Home className="size-5 text-primary opacity-50" />
          <Skeleton animationType="shimmer" className="h-5 w-40 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Monthly Recurring",
              sub: "Rent + estimated recurring fees",
            },
            { label: "Upfront Costs", sub: "Deposits & one-time fees" },
            { label: "Full-Term Commitment", sub: "Total across lease period" },
            { label: "Contract Duration", sub: "Active lease commitment" },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="p-4 flex flex-col justify-between min-h-[128px]"
            >
              <span className="text-xs font-medium text-default-400">
                {item.label}
              </span>
              <div className="my-2">
                <Skeleton
                  animationType="shimmer"
                  className="h-8 w-28 rounded-lg"
                />
              </div>
              <span className="text-xs text-default-400/80">{item.sub}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Decision Impact Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary opacity-50" />
            <Skeleton animationType="shimmer" className="h-5 w-36 rounded-md" />
          </div>
          <Skeleton animationType="shimmer" className="h-4 w-28 rounded" />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Monthly Difference",
                sub: "Calculating vs alternative...",
              },
              {
                label: "Upfront Difference",
                sub: "Initial move-in cost delta",
              },
              { label: "Full-Term Difference", sub: "Total lease cost delta" },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="p-4 flex flex-col justify-between min-h-[128px]"
              >
                <span className="text-xs font-medium text-default-400">
                  {item.label}
                </span>
                <div className="my-2">
                  <Skeleton
                    animationType="shimmer"
                    className="h-8 w-24 rounded-lg"
                  />
                </div>
                <span className="text-xs text-default-400/80">{item.sub}</span>
              </Card>
            ))}
          </div>

          {/* Impact callout skeleton */}
          <Card className="p-4 bg-default-50/70 border border-default-200/40">
            <div className="space-y-2">
              <Skeleton animationType="shimmer" className="h-4 w-5/6 rounded" />
              <Skeleton animationType="shimmer" className="h-4 w-2/3 rounded" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
