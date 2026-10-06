import { billDoctorLabel } from "@/lib/billDoctor";

/** Name shown in the accountant billing Doctor column. */
export function billDoctorName(doctor: unknown): string {
  return billDoctorLabel({ doctor });
}

function doctorKey(name: string): string {
  return name.trim().toLowerCase();
}

/** True when no doctor is selected, or the bill's doctor is one of the selected names. */
export function billMatchesDoctor(doctor: unknown, selected: string[] | null | undefined): boolean {
  if (!selected || selected.length === 0) return true;
  const name = doctorKey(billDoctorName(doctor));
  if (!name) return false;
  return selected.some((item) => doctorKey(item) === name);
}

/** Directory doctors plus doctors already printed on the loaded bills. */
export function doctorFilterOptions(
  directory: { name?: string | null }[] | null | undefined,
  bills: { doctor?: unknown }[] | null | undefined,
): string[] {
  const byKey = new Map<string, string>();
  const add = (raw: string) => {
    const name = raw.trim();
    const key = doctorKey(name);
    if (!key || key === "self" || name === "-") return;
    if (!byKey.has(key)) byKey.set(key, name);
  };

  for (const doctor of directory ?? []) {
    if (doctor?.name) add(doctor.name);
  }
  for (const bill of bills ?? []) {
    const name = billDoctorLabel(bill);
    if (name) add(name);
  }

  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}
