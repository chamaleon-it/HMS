/** Append a condition chip without replacing text the doctor already entered. */
export function appendConsultationNote(
  current: string | null | undefined,
  addition: string,
): string {
  const extra = addition.trim();
  const base = (current ?? "").trim();
  if (!extra) return base;
  if (!base) return extra;

  const parts = splitNote(base);
  if (parts.some((part) => part.toLowerCase() === extra.toLowerCase())) {
    return base;
  }
  return `${base}, ${extra}`;
}

/** Drop one chip's name and keep every other part of the note. */
export function removeConsultationNote(
  current: string | null | undefined,
  removal: string,
): string {
  const target = removal.trim().toLowerCase();
  const parts = splitNote(current ?? "");
  if (!target) return parts.join(", ");
  return parts.filter((part) => part.toLowerCase() !== target).join(", ");
}

function splitNote(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
