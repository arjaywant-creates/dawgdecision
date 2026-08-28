/** React & Next.js */
import React, { memo } from "react";

/** UI Components (HeroUI) */
import {
  Input,
  Label,
  TextField,
  FieldError,
  Fieldset,
  FieldGroup,
  Description,
  Surface,
} from "@heroui/react";

/** Form Handling & Validation */
import { Controller, Control, Path } from "react-hook-form";

/** Types */
import { CompareRequest, Scenario } from "@/types/comparison";

interface Props {
  title: string;
  prefix: "scenario_a" | "scenario_b";
  control: Control<CompareRequest>;
  selector?: React.ReactNode;

  sourcedValues?: Record<string, unknown> | null;
}

type FieldConfig = {
  name: keyof Scenario;
  label: string;
  type?: "text" | "number";
  placeholder?: string;
  min?: string;
};

/**
 * Controller wrapper for form fields to handle typing and validation automatically
 */
function FieldController({
  name,
  label,
  control,
  type = "number",
  placeholder,
  min,
  sourcedValue,
}: {
  name: Path<CompareRequest>;
  label: string;
  control: Control<CompareRequest>;
  type?: "text" | "number";
  placeholder?: string;
  min?: string;
  sourcedValue?: unknown;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const edited =
          sourcedValue !== undefined &&
          sourcedValue !== null &&
          field.value !== sourcedValue;

        return (
          <TextField
            className="w-full"
            isInvalid={!!fieldState.error}
            type={type}
            value={
              field.value === undefined || field.value === null
                ? ""
                : field.value.toString()
            }
            onChange={(val: any) => {
              if (type === "number") {
                let strVal = "";
                if (typeof val === "string") strVal = val;
                else if (typeof val === "number") strVal = val.toString();
                else if (val?.target?.value !== undefined) strVal = val.target.value;
                field.onChange(strVal === "" ? "" : Number(strVal));
              } else {
                field.onChange(val);
              }
            }}
            onKeyDown={(e: any) => {
              if (
                type === "number" &&
                (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+")
              ) {
                e.preventDefault();
              }
            }}
          >
            <Label>{label}</Label>
            <Input min={min} placeholder={placeholder} variant="secondary" />
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
            {edited && (
            <Description className="text-warning-500 text-xs">
              Edited by you
            </Description>
            )}
          </TextField>
        );
      }}
    />
  );
}

/**
 * Reusable form component for capturing scenario details
 */
export default memo(function ScenarioForm({
  title,
  prefix,
  control,
  selector,
  sourcedValues,
}: Props) {

  const requiredFields: FieldConfig[] = [
    { name: "name", label: "Housing Name", placeholder: title, type: "text" },
    { name: "housing_cost", label: "Housing Cost (Your Share)", min: "0" },
    {
      name: "cost_period_months",
      label: "Cost Period (Months)",
      min: "1",
      placeholder: "e.g. 1 for Monthly",
    },
    {
      name: "contract_months",
      label: "Contract/Stay Length (Months)",
      min: "1",
    },
  ];

  const optionalFields: FieldConfig[] = [
    { name: "utilities", label: "Utilities", min: "0", placeholder: "Unknown" },
    {
      name: "mandatory_fees",
      label: "Mandatory Recurring Fees",
      min: "0",
      placeholder: "Unknown",
    },
    { name: "parking", label: "Parking", min: "0", placeholder: "Unknown" },
    {
      name: "transportation",
      label: "Transportation",
      min: "0",
      placeholder: "Unknown",
    },
    {
      name: "upfront_costs",
      label: "Upfront/Move-in Costs",
      min: "0",
      placeholder: "Unknown",
    },
    {
      name: "commute_minutes",
      label: "Commute Time (Minutes)",
      min: "0",
      placeholder: "Unknown",
    },
  ];

  return (
    <Surface className="w-full rounded-2xl shadow-sm p-6" variant="default">
      <Fieldset className="w-full">
        <Fieldset.Legend className="text-2xl font-bold">
          {title}
        </Fieldset.Legend>
        <Description className="mb-4 block text-default-500">
          Enter the financial details for {title.toLowerCase()}.
        </Description>

        {selector}

        <div className="flex flex-col gap-6">
          {/* Required Fields */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide text-primary mb-3">
              Required
            </h4>
            <FieldGroup>
              {requiredFields.map((field) => (
                <FieldController
                  key={field.name}
                  control={control}
                  label={field.label}
                  min={field.min} 
                  name={`${prefix}.${field.name}` as Path<CompareRequest>}
                  placeholder={field.placeholder}
                  sourcedValue={sourcedValues?.[field.name]}
/>
              ))}
            </FieldGroup>
          </div>

          {/* Optional Fields */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide text-default-400 mb-3">
              Optional
            </h4>
            <FieldGroup>
              {optionalFields.map((field) => (
                <FieldController
                  key={field.name}
                  control={control}
                  label={field.label}
                  min={field.min}
                  name={`${prefix}.${field.name}` as Path<CompareRequest>}
                  placeholder={field.placeholder}
                />
              ))}
            </FieldGroup>
          </div>
        </div>
      </Fieldset>
    </Surface>
  );
});
