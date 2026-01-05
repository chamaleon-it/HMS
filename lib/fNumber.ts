export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(n || 0);

export function getDecimal(num: number) {
  const parts = num.toString().split(".");
  return parts[1] ? Number("0." + parts[1]) : 0;
}