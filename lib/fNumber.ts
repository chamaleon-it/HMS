export const formatINR = (n: number) => {
  const val = n || 0;
  const isInteger = Number.isInteger(val);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export function getDecimal(num: number) {
  const parts = num.toString().split(".");
  return parts[1] ? Number("0." + parts[1]) : 0;
}