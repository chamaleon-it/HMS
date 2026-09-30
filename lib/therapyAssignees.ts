export interface TherapyAssignee {
  _id: string;
  name: string;
  role?: string;
  qualification?: string;
  designation?: string;
  inCharge?: boolean;
  status?: string;
  phone?: string;
}

export function isActiveAssignee(person: { status?: string }) {
  const status = String(person.status || "").trim().toLowerCase();
  return !status || status === "active";
}

export function isDoctorAssignee(person: { role?: string }) {
  return String(person.role || "").trim().toLowerCase() === "doctor";
}

/** Active therapists first, then active doctor employees. Duplicate ids are dropped. */
export function mergeTherapyAssignees(
  therapists: TherapyAssignee[] = [],
  doctors: TherapyAssignee[] = [],
): TherapyAssignee[] {
  const seen = new Set<string>();
  const merged: TherapyAssignee[] = [];

  for (const person of [...therapists, ...doctors]) {
    if (!person || !isActiveAssignee(person)) continue;
    const name = String(person.name || "").trim();
    if (!name || name === "-") continue;
    const key = String(person._id || name).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...person, name });
  }

  return merged;
}
