import { DateTime } from "luxon";

/** What the API's `recurrence` field takes; see `api.yml` → `Recurrence`. */
export interface Recurrence {
  from: string;
  until: string;
  weekdays: number[];
  start_time: string;
  end_time: string;
  timezone: string;
}

export interface SeriesOccurrence {
  day: string;
  start: string;
  end: string;
  slot_id?: number | null;
  problem: string | null;
}

export interface SeriesResult {
  outcome: "preview" | "created" | "refused";
  message?: string;
  series_id: string | null;
  created: number[];
  occurrences: SeriesOccurrence[];
  summary: {
    total: number;
    ok: number;
    conflicts: number;
    cost_ms?: number;
    remaining_budget_ms?: number;
    budget_problem?: string | null;
  };
}

/**
 * A form's date as the calendar day the user picked.
 *
 * A bare `YYYY-MM-DD` is taken as written: parsing it with `Date` would read it
 * as UTC midnight and, west of Greenwich, land on the day before.
 */
export const toDay = (value: unknown): string => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return DateTime.fromJSDate(new Date(value as string)).toISODate() ?? "";
};

/** A time input's value — a Date, an ISO string or a luxon DateTime — as HH:MM. */
export const toTime = (value: unknown): string =>
  DateTime.fromJSDate(new Date(value as string)).toFormat("HH:mm");

/** ISO weekday (1 = Monday) of a day as picked. */
export const weekdayOf = (day: string): number => DateTime.fromISO(day).weekday;

/**
 * The browser's zone. Series times are wall-clock times in it, so a 09:00
 * series stays 09:00 across the clock changes.
 */
export const browserZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;
