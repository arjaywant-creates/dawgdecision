import { Scenario } from "@/types/comparison";
import { Card, Input, Label, TextField } from "@heroui/react";

interface Props {
  title: string;
  data: Scenario;
  onChange: (
    field: keyof Scenario,
    value: string | number
  ) => void;
}

function NumericField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <TextField
      className="w-full"
      type="number"
      value={value === 0 ? "" : value.toString()}
      onChange={(val: any) => {
        const strVal = typeof val === "string" ? val : val?.target?.value || "";
        onChange(strVal === "" ? 0 : Number(strVal));
      }}
    >
      <Label>{label}</Label>
      <Input min="0" />
    </TextField>
  );
}

export default function ScenarioForm({
  title,
  data,
  onChange,
}: Props) {
  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">
        {title}
      </h2>

      <div className="grid gap-4">
        <TextField
          className="w-full"
          type="text"
          value={data.name}
          onChange={(val: any) => {
            const strVal = typeof val === "string" ? val : val?.target?.value || "";
            onChange("name", strVal);
          }}
        >
          <Label>Scenario Name</Label>
          <Input placeholder={title} />
        </TextField>

        <NumericField
          label="Monthly Income"
          value={data.monthly_income}
          onChange={(v) =>
            onChange("monthly_income", v)
          }
        />

        <NumericField
          label="Rent"
          value={data.rent}
          onChange={(v) =>
            onChange("rent", v)
          }
        />

        <NumericField
          label="Utilities"
          value={data.utilities}
          onChange={(v) =>
            onChange("utilities", v)
          }
        />

        <NumericField
          label="Transportation"
          value={data.transportation}
          onChange={(v) =>
            onChange("transportation", v)
          }
        />

        <NumericField
          label="Mandatory Fees"
          value={data.mandatory_fees}
          onChange={(v) =>
            onChange("mandatory_fees", v)
          }
        />

        <NumericField
          label="Other Expenses"
          value={data.other_expenses}
          onChange={(v) =>
            onChange("other_expenses", v)
          }
        />

        <TextField
          className="w-full"
          type="number"
          value={data.lease_months === 0 ? "" : data.lease_months.toString()}
          onChange={(val: any) => {
            const strVal = typeof val === "string" ? val : val?.target?.value || "";
            onChange("lease_months", strVal === "" ? 0 : Number(strVal));
          }}
        >
          <Label>Lease Duration (Months)</Label>
          <Input min="1" />
        </TextField>
      </div>
    </Card>
  );
}