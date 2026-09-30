export function calendarDay(value: string) {
  return value.slice(0, 10);
}

export function formatCertificateDate(value?: string | null) {
  if (!value) return "";
  const day = calendarDay(value);
  const [year, month, date] = day.split("-");
  if (!year || !month || !date || year.length !== 4) return "";
  return `${date}/${month}/${year}`;
}

export function addCalendarDays(value: string, days: number) {
  const [year, month, date] = calendarDay(value).split("-").map(Number);
  if (!year || !month || !date) return "";
  const next = new Date(Date.UTC(year, month - 1, date + days));
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function resumeDate(dateTo?: string | null) {
  if (!dateTo) return "";
  return addCalendarDays(dateTo, 1);
}

export function certificatePronouns(gender: string) {
  const female = gender.trim().toLowerCase().startsWith("f");
  return {
    subject: female ? "She" : "He",
    possessive: female ? "her" : "his",
    title: female ? "Mrs" : "Mr",
  };
}

export function formatDoctorName(name: string) {
  const trimmed = name.trim();
  const withoutTitle = trimmed.replace(/^dr\.?\s+/i, "");
  return `Dr. ${withoutTitle}`;
}
