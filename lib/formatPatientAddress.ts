export type PatientAddressParts = {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pinCode?: string | null;
  country?: string | null;
  /** Legacy concatenated field — read-only fallback for old records */
  address?: string | null;
};

/** Build display address from structured patient fields. */
export function formatPatientAddress(p?: PatientAddressParts | null): string {
  if (!p) return "";
  const parts = [
    p.addressLine1,
    p.addressLine2,
    p.city,
    p.district,
    p.state,
    p.pinCode,
    p.country,
  ]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  if (parts.length) return parts.join(", ");
  return typeof p.address === "string" ? p.address.trim() : "";
}
