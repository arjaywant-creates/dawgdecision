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
import { Controller, Control, Path } from "react-hook-form";

import { CompareRequest } from "@/types/comparison";

interface Props {
  title: string;
  prefix: "scenario_a" | "scenario_b";
  control: Control<CompareRequest>;
}

function FieldController({
  name,
  label,
  control,
  type = "number",
  placeholder,
  min,
}: {
  name: Path<CompareRequest>;
  label: string;
  control: Control<CompareRequest>;
  type?: "text" | "number";
  placeholder?: string;
  min?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
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

              if (typeof val === "string") {
                strVal = val;
              } else if (typeof val === "number") {
                strVal = val.toString();
              } else if (val?.target?.value !== undefined) {
                strVal = val.target.value;
              }
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
        </TextField>
      )}
    />
  );
}

export default function ScenarioForm({ title, prefix, control }: Props) {
  return (
    <Surface className="w-full rounded-2xl shadow-sm p-6" variant="default">
      <Fieldset className="w-full">
        <Fieldset.Legend className="text-2xl font-bold">
          {title}
        </Fieldset.Legend>
        <Description className="mb-4 block text-default-500">
          Enter the financial details for {title.toLowerCase()}.
        </Description>

        <FieldGroup>
          <FieldController
            control={control}
            label="Scenario Name"
            name={`${prefix}.name`}
            placeholder={title}
            type="text"
          />

          <FieldController
            control={control}
            label="Monthly Income"
            min="0"
            name={`${prefix}.monthly_income`}
          />

          <FieldController
            control={control}
            label="Rent"
            min="0"
            name={`${prefix}.rent`}
          />

          <FieldController
            control={control}
            label="Utilities"
            min="0"
            name={`${prefix}.utilities`}
          />

          <FieldController
            control={control}
            label="Transportation"
            min="0"
            name={`${prefix}.transportation`}
          />

          <FieldController
            control={control}
            label="Mandatory Fees"
            min="0"
            name={`${prefix}.mandatory_fees`}
          />

          <FieldController
            control={control}
            label="Other Expenses"
            min="0"
            name={`${prefix}.other_expenses`}
          />

          <FieldController
            control={control}
            label="Lease Duration (Months)"
            min="1"
            name={`${prefix}.lease_months`}
          />
        </FieldGroup>
      </Fieldset>
    </Surface>
  );
}
