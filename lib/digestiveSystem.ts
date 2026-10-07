export const DIGESTIVE_OPTIONS = ["Normal", "Bloating", "APD", "GERD"] as const;

/** Load a saved digestive value. Older consultations stored one string. */
export function digestiveSelectionFromStored(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }
  return [];
}

export function digestiveSystemForSave(selected: string[]): string[] | null {
  return selected.length > 0 ? selected : null;
}

/**
 * Normal is exclusive. Bloating, APD, and GERD can be selected together,
 * and choosing any of them clears Normal.
 */
export function toggleDigestiveSelection(
  current: string[],
  option: string,
): string[] {
  const selected = current.includes(option);
  if (option === "Normal") {
    return selected ? [] : ["Normal"];
  }
  const withoutNormal = current.filter((value) => value !== "Normal");
  if (selected) {
    return withoutNormal.filter((value) => value !== option);
  }
  return [...withoutNormal, option];
}
