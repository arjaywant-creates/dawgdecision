import { Surface, Skeleton } from "@heroui/react";
import { Calculator, MapPin } from "lucide-react";

export default function CompareLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading comparison tools and housing data"
      className="pb-12 animate-in fade-in duration-200"
    >
      <span className="sr-only">
        Loading housing options, map data, and comparison tools...
      </span>

      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton animationType="shimmer" className="h-4 w-16 rounded" />
        <Skeleton animationType="shimmer" className="h-4 w-28 rounded" />
      </div>

      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4 mb-8">
        <div className="space-y-2">
          <Skeleton animationType="shimmer" className="h-10 w-64 rounded-xl" />
          <Skeleton
            animationType="shimmer"
            className="h-4 w-96 max-w-full rounded-md"
          />
        </div>
        <Skeleton animationType="shimmer" className="h-9 w-28 rounded-lg" />
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form Skeletons */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          <div className="grid gap-6 md:grid-cols-2 w-full min-w-0">
            {/* Option A & Option B Card Skeletons */}
            {["Option A", "Option B"].map((title) => (
              <Surface
                key={title}
                className="w-full rounded-2xl border border-separator/30 p-5 flex flex-col gap-4 shadow-xs"
                variant="default"
              >
                <div className="flex justify-between items-center pb-2 border-b border-separator/20">
                  <Skeleton
                    animationType="shimmer"
                    className="h-6 w-24 rounded-md"
                  />
                  <Skeleton
                    animationType="shimmer"
                    className="h-5 w-16 rounded-full"
                  />
                </div>

                {/* Sourced selector skeleton dropdown */}
                <div className="space-y-1.5">
                  <Skeleton
                    animationType="shimmer"
                    className="h-3.5 w-36 rounded"
                  />
                  <Skeleton
                    animationType="shimmer"
                    className="h-10 w-full rounded-xl"
                  />
                </div>

                {/* Form fields skeleton */}
                <div className="space-y-3.5 pt-1">
                  {[
                    "Monthly Rent",
                    "Cost Period",
                    "Lease Duration",
                    "Utilities",
                    "Mandatory Fees",
                    "Parking",
                    "Upfront Costs",
                  ].map((field) => (
                    <div key={field} className="space-y-1.5">
                      <Skeleton
                        animationType="shimmer"
                        className="h-3.5 w-24 rounded"
                      />
                      <Skeleton
                        animationType="shimmer"
                        className="h-10 w-full rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </Surface>
            ))}
          </div>

          {/* Action Buttons Skeleton */}
          <div className="mt-2 flex flex-col sm:flex-row gap-4">
            <Skeleton
              animationType="shimmer"
              className="h-12 w-full sm:w-48 rounded-xl"
            />
            <Skeleton
              animationType="shimmer"
              className="h-12 w-full sm:w-28 rounded-xl"
            />
          </div>
        </div>

        {/* Right Column: Results Column Skeleton */}
        <div className="lg:col-span-4 min-w-0 hidden lg:block">
          <Surface
            className="w-full h-full min-h-[460px] flex flex-col rounded-2xl shadow-sm border border-separator/30 overflow-hidden p-6"
            variant="default"
          >
            <div className="flex flex-col items-center justify-center text-center h-full gap-4 py-8">
              <div className="w-16 h-16 bg-content2/80 rounded-full flex items-center justify-center mb-2">
                <Calculator className="w-8 h-8 text-default-300" />
              </div>
              <div className="space-y-2 w-full max-w-[240px]">
                <Skeleton
                  animationType="shimmer"
                  className="h-5 w-40 mx-auto rounded-md"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-3.5 w-full rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-3.5 w-4/5 mx-auto rounded"
                />
              </div>
              <div className="w-full mt-4 space-y-2 pt-4 border-t border-separator/30">
                <Skeleton
                  animationType="shimmer"
                  className="h-3 w-3/4 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-3 w-2/3 rounded"
                />
                <Skeleton
                  animationType="shimmer"
                  className="h-3 w-4/5 rounded"
                />
              </div>
            </div>
          </Surface>
        </div>
      </div>

      {/* Interactive Map Skeleton */}
      <div className="mt-8 w-full">
        <div className="w-full h-[320px] rounded-2xl border border-separator/40 bg-surface/40 flex flex-col items-center justify-center gap-3 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-default-200/60 flex items-center justify-center text-default-400">
            <MapPin className="size-6" />
          </div>
          <div className="text-center space-y-2 w-full max-w-xs">
            <Skeleton
              animationType="shimmer"
              className="h-4 w-48 mx-auto rounded"
            />
            <Skeleton
              animationType="shimmer"
              className="h-3 w-64 mx-auto rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
