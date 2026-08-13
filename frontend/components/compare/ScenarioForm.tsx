import { CompareRequest } from "@/types/comparison";
import { Card, Input, Label, TextField, FieldError } from "@heroui/react";
import { Controller, Control, Path } from "react-hook-form";

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
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          className="w-full"
          type={type}
          value={field.value === undefined || field.value === null ? "" : field.value.toString()}
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
            if (type === "number" && (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+")) {
              e.preventDefault();
            }
          }}
          isInvalid={!!fieldState.error}
        >
          <Label>{label}</Label>
          <Input placeholder={placeholder} min={min} />
          {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
        </TextField>
      )}
    />
  );
}

export default function ScenarioForm({
  title,
  prefix,
  control,
}: Props) {
  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">
        {title}
      </h2>

      <div className="grid gap-4">
        <FieldController
          name={`${prefix}.name`}
          label="Scenario Name"
          control={control}
          type="text"
          placeholder={title}
        />

        <FieldController
          name={`${prefix}.monthly_income`}
          label="Monthly Income"
          control={control}
          min="0"
        />

        <FieldController
          name={`${prefix}.rent`}
          label="Rent"
          control={control}
          min="0"
        />

        <FieldController
          name={`${prefix}.utilities`}
          label="Utilities"
          control={control}
          min="0"
        />

        <FieldController
          name={`${prefix}.transportation`}
          label="Transportation"
          control={control}
          min="0"
        />

        <FieldController
          name={`${prefix}.mandatory_fees`}
          label="Mandatory Fees"
          control={control}
          min="0"
        />

        <FieldController
          name={`${prefix}.other_expenses`}
          label="Other Expenses"
          control={control}
          min="0"
        />

        <FieldController
          name={`${prefix}.lease_months`}
          label="Lease Duration (Months)"
          control={control}
          min="1"
        />
      </div>
    </Card>
  );
}