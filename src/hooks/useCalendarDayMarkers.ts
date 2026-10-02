import { useCallback } from "react";
import { useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";

/**
 * Which days of a month carry at least one slot or reservation.
 *
 * The calendar loads a week at a time; the date picker shows a month, and a
 * month the calendar has never visited. So this is its own query rather than a
 * filter over what the grid already holds — otherwise the dots would appear
 * only on the week you are already looking at, which is the one week you do not
 * need them for.
 *
 * Same filter shape as `useCalendarData`: `showOld` because the backend hides
 * past entries by default, and an overlap comparison rather than
 * fully-inside so an entry straddling the month boundary still counts.
 */
export function useCalendarDayMarkers(
  month: DateTime,
  includeReservations: boolean,
) {
  const dataProvider = useDataProvider();
  const start = month.startOf("month");
  const end = month.endOf("month");

  const fetchMarkers = useCallback(async (): Promise<Set<string>> => {
    const filter = {
      showOld: true,
      start_lte: end.toUTC().toISO(),
      end_gte: start.toUTC().toISO(),
    };
    const list = (resource: string) =>
      dataProvider.getList(resource, {
        filter,
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "start", order: "ASC" },
      });

    const [slots, reservations] = await Promise.all([
      list("slots"),
      includeReservations
        ? list("reservations")
        : Promise.resolve({ data: [] as unknown[] }),
    ]);

    const days = new Set<string>();
    for (const row of [...slots.data, ...reservations.data] as Array<{
      start?: string;
      end?: string;
    }>) {
      const from = DateTime.fromISO(row.start ?? "");
      const to = DateTime.fromISO(row.end ?? "");
      if (!from.isValid) continue;
      // An entry can span more than one day, so mark every day it covers.
      // Clamped to the month on both ends: without the clamp a long slot would
      // walk day by day from its own start, which for a year-long entry is
      // hundreds of iterations to reach the month actually being displayed.
      let cursor = DateTime.max(from.startOf("day"), start.startOf("day"));
      const last = DateTime.min(
        (to.isValid ? to : from).startOf("day"),
        end.startOf("day"),
      );
      while (cursor <= last) {
        const iso = cursor.toISODate();
        if (iso) days.add(iso);
        cursor = cursor.plus({ days: 1 });
      }
    }
    return days;
  }, [dataProvider, includeReservations, start, end]);

  const { data, isLoading } = useQuery<Set<string>, Error>({
    // Keyed on the month, so paging back and forth through the picker is served
    // from the cache rather than refetched.
    queryKey: ["calendar-day-markers", start.toISODate(), includeReservations],
    queryFn: fetchMarkers,
  });

  return { markedDays: data, loadingMarkers: isLoading };
}
