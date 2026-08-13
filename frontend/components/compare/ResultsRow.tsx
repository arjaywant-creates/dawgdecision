interface ResultsRowProps {
  label: string;
  firstValue: string | number;
  secondValue: string | number;
}

export default function ResultsRow({
  label,
  firstValue,
  secondValue,
}: ResultsRowProps) {
  return (
    <div className="grid grid-cols-3 items-center border-b border-default-200 px-4 py-3">
      <div className="font-medium">
        {label}
      </div>

      <div className="text-center">
        {firstValue}
      </div>

      <div className="text-center">
        {secondValue}
      </div>
    </div>
  );
}
