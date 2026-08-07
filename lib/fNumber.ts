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

export function numberToWords(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "";
  const amount = Math.floor(Math.abs(num));
  if (amount === 0) return "ZERO ONLY";

  const ones = [
    "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE",
    "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN",
    "SEVENTEEN", "EIGHTEEN", "NINETEEN"
  ];
  const tens = [
    "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"
  ];

  function convertChunk(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + convertChunk(n % 10);
    return ones[Math.floor(n / 100)] + " HUNDRED " + convertChunk(n % 100);
  }

  let words = "";
  let temp = amount;

  if (temp >= 10000000) {
    words += convertChunk(Math.floor(temp / 10000000)) + "CRORE ";
    temp %= 10000000;
  }
  if (temp >= 100000) {
    words += convertChunk(Math.floor(temp / 100000)) + "LAKH ";
    temp %= 100000;
  }
  if (temp >= 1000) {
    words += convertChunk(Math.floor(temp / 1000)) + "THOUSAND ";
    temp %= 1000;
  }
  if (temp > 0) {
    words += convertChunk(temp);
  }

  return words.trim() + " ONLY";
}