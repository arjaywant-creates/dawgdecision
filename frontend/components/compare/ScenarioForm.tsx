import { HousingScenario } from "@/types/comparison";

interface Props {
  title: string;
  data: HousingScenario;
  onChange: (
    field: keyof HousingScenario,
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
    <label className="flex flex-col gap-1">
      <span className="font-medium">
        {label}
      </span>

      <input
        type="number"
        min="0"
        value={value === 0 ? "" : value}
        onChange={(e) =>
          onChange(
            e.target.value === ""
              ? 0
              : Number(e.target.value)
          )
        }
        className="rounded-md border p-2 text-black"
      />
    </label>
  );
}

export default function ScenarioForm({
  title,
  data,
  onChange,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm text-black">
      <h2 className="mb-6 text-2xl font-bold">
        {title}
      </h2>

      <div className="grid gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-medium">
            Scenario Name
          </span>

          <input
            type="text"
            value={data.name}
            placeholder="Apartment A"
            onChange={(e) =>
              onChange("name", e.target.value)
            }
            className="rounded-md border p-2 text-black"
          />
        </label>

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

        <label className="flex flex-col gap-1">
          <span className="font-medium">
            Lease Duration (Months)
          </span>

          <input
            type="number"
            min="1"
            value={data.lease_months}
            onChange={(e) =>
              onChange(
                "lease_months",
                Number(e.target.value)
              )
            }
            className="rounded-md border p-2 text-black"
          />
        </label>
      </div>
    </div>
  );
}