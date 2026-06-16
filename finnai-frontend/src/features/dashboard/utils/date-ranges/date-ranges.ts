import type { DateRange, DateRangePreset } from "@/features/dashboard/types";

function toIso(date: Date): string {
  return date.toISOString();
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function resolveDateRange(preset: DateRangePreset): DateRange {
  const end = new Date();
  const start = new Date(end);

  if (preset === "7d") {
    start.setDate(end.getDate() - 6);
    return { preset, startDate: toIso(start), endDate: toIso(end), granularity: "daily" };
  }

  if (preset === "last_30_days") {
    start.setDate(end.getDate() - 29);
    return { preset, startDate: toIso(start), endDate: toIso(end), granularity: "daily" };
  }

  if (preset === "last_90_days") {
    start.setDate(end.getDate() - 89);
    return { preset, startDate: toIso(start), endDate: toIso(end), granularity: "weekly" };
  }

  if (preset === "next_30_days") {
    const s = startOfDay(end);
    const future = new Date(s);
    future.setDate(future.getDate() + 30);
    return { preset, startDate: toIso(s), endDate: toIso(future), granularity: "daily" };
  }

  if (preset === "next_90_days") {
    const s = startOfDay(end);
    const future = new Date(s);
    future.setDate(future.getDate() + 90);
    return { preset, startDate: toIso(s), endDate: toIso(future), granularity: "weekly" };
  }

  if (preset === "this_year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    const yearEnd = new Date(end.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { preset, startDate: toIso(start), endDate: toIso(yearEnd), granularity: "monthly" };
  }

  if (preset === "1y") {
    start.setFullYear(end.getFullYear() - 1);
    return { preset, startDate: toIso(start), endDate: toIso(end), granularity: "monthly" };
  }

  // 30d and this_month: current month
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return {
    preset: preset === "30d" ? "30d" : "this_month",
    startDate: toIso(start),
    endDate: toIso(end),
    granularity: "weekly",
  };
}

export function isFuturePreset(preset: DateRangePreset): boolean {
  return preset === "next_30_days" || preset === "next_90_days";
}
