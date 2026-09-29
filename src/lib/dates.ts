import { addMinutes, format, parseISO, startOfDay } from "date-fns";

export function todayKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function asDateKey(value: string | Date) {
  return typeof value === "string" ? value : todayKey(value);
}

export function clampHalfHour(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(24 * 60, Math.round(value / 30) * 30));
}

export function minutesToLabel(minutes: number) {
  const hr = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const min = Math.abs(minutes % 60)
    .toString()
    .padStart(2, "0");
  return `${hr}:${min}`;
}

export function labelToMinutes(value: string) {
  const [h, m] = value.split(":").map((v) => Number.parseInt(v, 10));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function buildTimeOptions(step = 30) {
  const options: { value: number; label: string }[] = [];
  for (let i = 0; i <= 24 * 60; i += step) {
    options.push({ value: i, label: minutesToLabel(i) });
  }
  return options;
}

export function tsAtDate(dateKey: string, minuteOfDay: number) {
  const base = parseISO(`${dateKey}T00:00:00.000Z`);
  return addMinutes(startOfDay(base), minuteOfDay);
}

export function roundDate(date: Date, increment: number) {
  if (!increment || increment <= 0) return date;
  const minutes = date.getUTCMinutes();
  const rounded = Math.round(minutes / increment) * increment;
  const out = new Date(date);
  out.setUTCMinutes(rounded, 0, 0);
  return out;
}

export function durationMin(start: Date, end: Date | null) {
  if (!end) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function weekRange(startDate: string) {
  const start = parseISO(`${startDate}T00:00:00.000Z`);
  const dates: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    dates.push(todayKey(addMinutes(start, i * 24 * 60)));
  }
  return dates;
}



