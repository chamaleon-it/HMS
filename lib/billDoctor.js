/**
 * Doctor name for a billing invoice row.
 *
 * Pharmacy bills already carry the doctor. Therapy and procedure bills often
 * do not: the visit stored the name, and the bill saved no id. Read the doctor
 * on the bill, then the visit or appointment, then the patient. Never use the
 * therapist. Placeholders such as "-" or "Self" are not a name.
 */

const PLACEHOLDERS = new Set(["", "-", "—", "self", "doctor", "n/a", "na"]);

function displayDoctorName(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    const text = value.trim().replace(/\s+/g, " ");
    if (!text || PLACEHOLDERS.has(text.toLowerCase())) return "";
    return text;
  }
  if (typeof value === "object") return displayDoctorName(value.name);
  return "";
}

export function billDoctorLabel(bill) {
  const candidates = [
    bill?.doctor,
    bill?.doctorName,
    bill?.appointment?.doctor,
    bill?.visit?.doctor,
    bill?.consulting?.doctor,
    bill?.patient?.doctor,
  ];
  for (const candidate of candidates) {
    const name = displayDoctorName(candidate);
    if (name) return name;
  }
  return "";
}
