export function doctorPrintLines(doctor?: {
  name?: string | null;
  designation?: string | null;
  qualification?: string | null;
  specialization?: string | null;
} | null, doctorNameFallback?: string | null) {
  const rawName =
    (doctor?.name && doctor.name !== "-" ? doctor.name : null) ||
    (doctorNameFallback && doctorNameFallback !== "-"
      ? doctorNameFallback
      : null);
  const displayName = rawName
    ? rawName.toUpperCase().startsWith("DR")
      ? rawName
      : `Dr. ${rawName}`
    : "—";

  return {
    name: displayName,
    designation: doctor?.designation?.trim() || "—",
    qualification: doctor?.qualification?.trim() || "—",
    specialization: doctor?.specialization?.trim() || "—",
  };
}
