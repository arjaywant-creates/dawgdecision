"use client";

import dynamic from "next/dynamic";
import { Surface, Spinner } from "@heroui/react";

import { SourcedHousingOption } from "@/types/sourced-housing";

interface Props {
  optionA?: SourcedHousingOption | null;
  optionB?: SourcedHousingOption | null;
  scenarioAName?: string;
  scenarioBName?: string;
  className?: string;
}

const DynamicHousingLocationMap = dynamic(
  () => import("./HousingLocationMapClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center w-full h-[340px] sm:h-[400px] lg:h-[430px] bg-default-100/60 rounded-xl gap-3">
        <Spinner size="md" />
        <span className="text-xs text-default-500 font-medium">
          Loading Campus Map...
        </span>
      </div>
    ),
  },
);

export default function HousingLocationMap(props: Props = {}) {
  return (
    <Surface
      className="w-full rounded-2xl shadow-sm border border-separator/30 overflow-hidden p-0"
      variant="default"
    >
      <DynamicHousingLocationMap {...props} />
    </Surface>
  );
}