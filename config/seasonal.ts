/** Home rows for holiday games. Dates are inclusive and use Asia/Kolkata. */
export const SEASONAL_WINDOWS = [
  {
    id: 'halloween',
    name: 'Halloween games',
    rawCategory: 'halloween',
    startMonth: 10,
    startDay: 15,
    endMonth: 11,
    endDay: 1,
  },
  {
    id: 'christmas',
    name: 'Christmas games',
    rawCategory: 'christmas',
    startMonth: 12,
    startDay: 1,
    endMonth: 1,
    endDay: 2,
  },
] as const;

export type SeasonalWindow = (typeof SEASONAL_WINDOWS)[number];

export function istMonthDay(date: Date): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  return { month, day };
}

function stamp(month: number, day: number): number {
  return month * 100 + day;
}

export function windowContains(
  window: SeasonalWindow,
  month: number,
  day: number,
): boolean {
  const current = stamp(month, day);
  const start = stamp(window.startMonth, window.startDay);
  const end = stamp(window.endMonth, window.endDay);
  if (start <= end) return current >= start && current <= end;
  return current >= start || current <= end;
}

export function activeSeasonal(date: Date): SeasonalWindow[] {
  const { month, day } = istMonthDay(date);
  return SEASONAL_WINDOWS.filter((item) => windowContains(item, month, day));
}
