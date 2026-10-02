import { useState, useEffect, useCallback } from "react";
import { useDataProvider } from "react-admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateTime, Duration } from "luxon";

type CalendarData = {
  slots: any[];
  reservations: any[];
};

type Range = { start: Date; end: Date };

export function useCalendarData(
  includeReservations: boolean,
  range: Range,
  currentView: string
) {
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();

  // Keep previous data for placeholder
  const [prevData, setPrevData] = useState<CalendarData | undefined>();

  const fetchData = useCallback(async (range: Range): Promise<CalendarData> => {
    const { start, end } = range;

    const [slotsRes, reservationsRes] = await Promise.all([
      dataProvider.getList("slots", {
        // showOld: include past entries (the backend hides them by default);
        // overlap (not fully-inside) so events spanning the range edges are
        // included too.
        filter: {
          showOld: true,
          start_lte: end.toISOString(),
          end_gte: start.toISOString(),
        },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "start", order: "ASC" },
      }),
      includeReservations
        ? dataProvider.getList("reservations", {
            // showOld: include past entries (the backend hides them by default);
        // overlap (not fully-inside) so events spanning the range edges are
        // included too.
        filter: {
          showOld: true,
          start_lte: end.toISOString(),
          end_gte: start.toISOString(),
        },
            pagination: { page: 1, perPage: 1000 },
            sort: { field: "start", order: "ASC" },
          })
        : Promise.resolve({ data: [] }),
    ]);

    const mappedSlots = slotsRes.data.map((slot: any) => ({
      id: slot.id,
      start: new Date(slot.start),
      end: new Date(slot.end),
      isBackground: true,
      org_id: slot.org_id,
      organization: slot.organization,
      title: slot.organization.name,
    }));

    const mappedReservations = reservationsRes.data.map((res: any) => ({
      id: res.id,
      start: new Date(res.start),
      end: new Date(res.end),
      title: res.description,
    }));

    return { slots: mappedSlots, reservations: mappedReservations };
  }, [dataProvider, includeReservations]);

  // Main query
  const { data, isLoading, error } = useQuery<CalendarData, Error>({
    queryKey: ["calendar", range.start.toISOString(), range.end.toISOString()],
    queryFn: () => fetchData(range),
    placeholderData: prevData, // show previous data while fetching new range
  });

  // Update prevData whenever new data arrives
  useEffect(() => {
    if (data) setPrevData(data);
  }, [data]);

  // Prefetch adjacent ranges
  useEffect(() => {
    const luxonViewMap: Record<string, keyof Duration> = {
      month: "months",
      week: "weeks",
      work_week: "weeks",
      day: "days",
      agenda: "days",
    };
    const unit = luxonViewMap[currentView] || "weeks";

    const prevStart = DateTime.fromJSDate(range.start).minus({ [unit]: 1 }).toJSDate();
    const prevEnd = DateTime.fromJSDate(range.end).minus({ [unit]: 1 }).toJSDate();
    const nextStart = DateTime.fromJSDate(range.start).plus({ [unit]: 1 }).toJSDate();
    const nextEnd = DateTime.fromJSDate(range.end).plus({ [unit]: 1 }).toJSDate();

    queryClient.prefetchQuery({
      queryKey: ["calendar", prevStart.toISOString(), prevEnd.toISOString()],
      queryFn: () => fetchData({ start: prevStart, end: prevEnd }),
    });

    queryClient.prefetchQuery({
      queryKey: ["calendar", nextStart.toISOString(), nextEnd.toISOString()],
      queryFn: () => fetchData({ start: nextStart, end: nextEnd }),
    });
  }, [range, currentView, fetchData, queryClient]);

  return {
    slots: data?.slots || [],
    reservations: data?.reservations || [],
    loading: isLoading,
    error,
  };
}
