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

function addressField(
  patient: object | null | undefined,
  key: "addressLine1" | "addressLine2",
): string {
  if (!patient) return "";
  const value = (patient as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

/** Home address when it has a value, otherwise place address. */
export function printHomeOrPlaceAddress(patient?: object | null): string {
  const home = addressField(patient, "addressLine1");
  if (home) return home;
  return addressField(patient, "addressLine2");
}

/** Phone number stored at patient registration. */
export function printPatientPhone(patient?: object | null): string {
  if (!patient) return "";
  const record = patient as Record<string, unknown>;
  for (const key of ["phoneNumber", "phone"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Keep the printed patient, filling home/place from a fuller record when needed. */
export function patientWithPrintAddress<T extends object>(
  patient: T | null | undefined,
  fallback?: object | null,
): T | null | undefined {
  if (patient && printHomeOrPlaceAddress(patient)) return patient;
  if (!fallback || !printHomeOrPlaceAddress(fallback)) return patient ?? null;
  if (!patient) return fallback as T;
  return {
    ...patient,
    addressLine1: addressField(fallback, "addressLine1"),
    addressLine2: addressField(fallback, "addressLine2"),
  };
}
