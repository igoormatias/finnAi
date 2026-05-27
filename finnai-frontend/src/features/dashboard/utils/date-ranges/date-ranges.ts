import type { DateRange, DateRangePreset } from "@/features/dashboard/types";

function toIso(date: Date): string {
  return date.toISOString();
}

export function resolveDateRange(preset: DateRangePreset): DateRange {
  const end = new Date();
  const start = new Date(end);

  if (preset === "7d") {
    start.setDate(end.getDate() - 6);
    return {
      preset,
      startDate: toIso(start),
      endDate: toIso(end),
      granularity: "daily",
    };
  }

  if (preset === "1y") {
    start.setFullYear(end.getFullYear() - 1);
    return {
      preset,
      startDate: toIso(start),
      endDate: toIso(end),
      granularity: "monthly",
    };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return {
    preset: "30d",
    startDate: toIso(start),
    endDate: toIso(end),
    granularity: "weekly",
  };
}
