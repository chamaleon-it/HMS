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
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear().toString().slice(-2);
  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = fTime(d);
  return `${formattedDate} ${formattedTime}`;
}

export function to12h(time24: string) {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

export function fAge(date: Date | string = new Date()): number {
  const dob = new Date(date);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasHadBirthdayThisYear) age--;

  return age;
}

export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

export const startOfToday = () => startOfDay(new Date());

export function generateTimeSlots(
  start: string,
  end: string,
  intervalMinutes: number
) {
  const times: string[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const current = new Date();
  current.setHours(startH, startM, 0, 0);
  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);
  while (current <= endDate) {
    const hh = current.getHours().toString().padStart(2, "0");
    const mm = current.getMinutes().toString().padStart(2, "0");
    times.push(`${hh}:${mm}`);
    current.setMinutes(current.getMinutes() + intervalMinutes);
  }
  return times;
}

export function combineToIST(date: Date, time: string) {
  const [h, m] = time.split(":").map(Number);
  const istDate = new Date(date);
  istDate.setHours(h, m, 0, 0);
  return istDate;
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const isSameDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();

export const isBeforeDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() < startOfDay(b).getTime();

export const dayNameToIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};




export function combineDateAndSlot(date: Date, slot: string) {
  // slot like "09:30 AM"
  const [time, meridian] = slot.split(" ");
  let hours = Number(time.split(":")[0]);

  const minutes = Number(time.split(":")[1]);

  // Convert to 24-hour format
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;

  // Create new date with time attached (IST)
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);

  return result;
}
