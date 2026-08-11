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
    <div className="grid grid-cols-3 items-center border-b border-gray-200 px-4 py-3">
      <div className="font-medium text-black">
        {label}
      </div>

      <div className="text-center text-black">
        {firstValue}
      </div>

      <div className="text-center text-black">
        {secondValue}
      </div>
    </div>
  );
}