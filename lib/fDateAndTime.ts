// ==============================
// Date & Time Format Utilities
// ==============================

// Format Date → "08 Oct 2025"
export function fDate(date?: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Format Time → "10:25 AM"
export function fTime(date?: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Format Date + Time → "08 Oct 2025, 10:25 AM"
export function fDateandTime(date?: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  const formattedDate = fDate(d);
  const formattedTime = fTime(d);
  return `${formattedDate}, ${formattedTime}`;
}
