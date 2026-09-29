// Pure calculation logic, no React Native imports, so it can be unit tested with `node --test`.

/** Target hours per weekday, index 0 = Monday ... 6 = Sunday. */
export type WeekHours = [number, number, number, number, number, number, number];

export type Settings = {
  limitPercent: number;
  weekHours: WeekHours;
};

/** A day without an entry is an office day. */
export type DayEntry = { kind: 'home'; hours: number } | { kind: 'absent' };

export type Days = Record<string, DayEntry>;

export const DEFAULT_SETTINGS: Settings = {
  limitPercent: 30,
  weekHours: [8.5, 8.5, 8.5, 8.5, 4.5, 0, 0],
};

export type MonthStats = {
  /** Target working hours of the month, absent days excluded. */
  total: number;
  home: number;
  percent: number;
  /** Home office hours still allowed; negative when the limit is exceeded. */
  remaining: number;
  overLimit: boolean;
};

export function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Weekday with Monday = 0. `month` is 1-based. */
export function weekdayIndex(year: number, month: number, day: number): number {
  return (new Date(year, month - 1, day).getDay() + 6) % 7;
}

export function targetHours(settings: Settings, year: number, month: number, day: number): number {
  return settings.weekHours[weekdayIndex(year, month, day)];
}

/** Home office hours of a day, capped at the day's target hours. */
export function homeHours(entry: DayEntry | undefined, dayTarget: number): number {
  if (!entry || entry.kind !== 'home') return 0;
  return Math.min(Math.max(entry.hours, 0), dayTarget);
}

export function monthStats(settings: Settings, days: Days, year: number, month: number): MonthStats {
  let total = 0;
  let home = 0;
  for (let day = 1; day <= daysInMonth(year, month); day++) {
    const target = targetHours(settings, year, month, day);
    const entry = days[isoDate(year, month, day)];
    if (target <= 0 || entry?.kind === 'absent') continue;
    total += target;
    home += homeHours(entry, target);
  }
  const percent = total > 0 ? (home / total) * 100 : 0;
  const remaining = (total * settings.limitPercent) / 100 - home;
  return { total, home, percent, remaining, overLimit: percent > settings.limitPercent };
}

/** Parses user input like "4,5" or "4.5"; returns null for anything that is not a finite number. */
export function parseNumber(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(value) ? value : null;
}

/** Formats hours/percent for display: at most two decimals, German decimal comma. */
export function formatNumber(value: number): string {
  return (Math.round(value * 100) / 100).toString().replace('.', ',');
}
