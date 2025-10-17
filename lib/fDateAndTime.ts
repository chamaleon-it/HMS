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

export function fDateandTime(date?: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  const formattedDate = fDate(d);
  const formattedTime = fTime(d);
  return `${formattedDate}, ${formattedTime}`;
}


export function to12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}