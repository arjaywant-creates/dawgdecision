/**
 * Format a number as a currency string with two decimal places.
 * @param value The numerical value to format
 * @returns The formatted currency string
 */
export const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Format a difference value as a string, handling nulls.
 * @param val The numerical difference value or null
 * @param suffix An optional suffix (like '/month')
 * @returns The formatted string
 */
export const diffStr = (val: number | null, suffix = "") => {
  if (val === null) return "Unknown";
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  return `${isNegative ? "-" : ""}$${formatCurrency(absVal)}${suffix}`;
};
