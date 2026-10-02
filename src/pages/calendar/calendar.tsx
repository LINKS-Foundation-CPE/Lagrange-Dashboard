import { useState, useCallback } from "react";
import { useRedirect } from "react-admin";
import { Calendar, luxonLocalizer, View, SlotInfo } from "react-big-calendar";
import { DateTime } from "luxon";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { useBackendToken } from "../../hooks/useBackendToken";
import { useCalendarData } from "../../hooks/useCalendarData";
import CalendarToolbar, { CalendarDayMarkersProvider } from "./CalendarToolbar";

const localizer = luxonLocalizer(DateTime);

// Module scope: a fresh object here would remount the toolbar on every render.
const calendarComponents = { toolbar: CalendarToolbar };

type CalendarProps = {
  hideReservations: boolean;
  addReservations?: boolean;
  addSlots?: boolean;
  userInfo: any;
};

type HandleSelectEventProps = {
  id: number;
  start: Date;
  end: Date;
  isBackgroundEvent?: boolean;
  organization?: { id: number; name: string };
};

function normalizeWorkWeekRange(range: any): { start: Date; end: Date } {
  let start: Date;

  if (Array.isArray(range)) {
    start = range[0];
  } else if (range?.start) {
    start = range.start;
  } else {
    start = new Date();
  }

  // force Monday–Friday window and make the end inclusive
  const startDt = DateTime.fromJSDate(start).startOf("week"); //.plus({ days: 1 }); // Monday
  const endDt = startDt.plus({ days: 4 }).endOf("day"); // Friday 23:59:59

  return { start: startDt.toJSDate(), end: endDt.toJSDate() };
}

const getCurrentWeekRange = (): { start: Date; end: Date } => {
  const today = DateTime.now();
  const startOfWeek = today.startOf("week"); //.plus({ days: 1 }); // Monday
  const endOfWeek = today.endOf("week"); //startOfWeek.plus({ days: 4 }); // Friday
  return { start: startOfWeek.toJSDate(), end: endOfWeek.toJSDate() };
};

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const MyCalendar = ({
  hideReservations,
  addReservations,
  addSlots,
}: CalendarProps) => {
  const redirect = useRedirect();
  //const { data: user } = useGetIdentity();
  const decodedBackend = useBackendToken();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("work_week");
  type Range = { start: Date; end: Date };

  const [dateRange, setDateRange] = useState<Range>(() =>
    getCurrentWeekRange(),
  );

  // Debounced range change
  const handleRangeChange = useCallback(
    debounce((range: any) => {
      const { start, end } = normalizeWorkWeekRange(range);

      setDateRange(() => ({ start, end })); // functional updater
    }, 300),
    [],
  );

  // Fetch events using new hook
  const { slots, reservations, loading, error } = useCalendarData(
    !hideReservations,
    dateRange,
    currentView,
  );

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      if (slotInfo.action !== "select") return;
      redirect(
        "create",
        "slots",
        undefined,
        {},
        {
          record: {
            day: slotInfo.start,
            start: slotInfo.start,
            end: slotInfo.end,
          },
        },
      );
    },
    [redirect],
  );

  const handleSelectEvent = useCallback(
    (event: HandleSelectEventProps) => {
      if (!event.isBackgroundEvent) return;

      if (!decodedBackend?.organization && !decodedBackend?.roles) return;

      const isSameOrg =
        event.organization?.id === decodedBackend?.organization?.id ||
        event.organization?.id ===
          decodedBackend?.organization?.reference_organization_id;
      const isAdmin = decodedBackend?.roles?.includes("admin");

      if (!isSameOrg && !isAdmin) {
        window.alert("Not your organization");
        return;
      }

      //const title = window.prompt("New Event name");
      //if (title) {
      redirect(
        "create",
        "reservations",
        undefined,
        {},
        {
          record: { slot_id: event.id, day: event.start, description: "" },
        },
      );
      //}
    },
    [decodedBackend, redirect],
  );

  const eventPropGetter = (event: any) => {
    // Past events (already ended) are faded so history is visible but clearly
    // distinct from current/upcoming occupancy.
    const isPast = new Date(event.end).getTime() < Date.now();
    if (event.isBackground) {
      let backgroundColor = "rgba(0, 0, 255, 0.2)";
      if (event.organization?.id !== decodedBackend?.organization?.id) {
        backgroundColor = "rgb(183, 8, 8)";
      }
      if (event.organization?.id === decodedBackend?.organization?.id) {
        backgroundColor = "rgb(5, 65, 5)";
      }
      if (
        event.organization?.id ===
        decodedBackend?.organization?.reference_organization_id
      ) {
        backgroundColor = "rgb(98, 129, 98)";
      }
      return {
        className: "rbc-background-event",
        style: { backgroundColor, opacity: isPast ? 0.3 : 1 },
      };
    }
    // Reservation (foreground) events: grey out past ones.
    if (isPast) {
      return {
        style: {
          backgroundColor: "#9e9e9e",
          borderColor: "#8a8a8a",
          opacity: 0.7,
        },
      };
    }
    return {};
  };

  if (loading) return <p>Loading calendar...</p>;
  if (error) return <p>Error: {String(error)}</p>;

  return (
    // The dots on the toolbar's date picker are scoped the same way the grid
    // is: reservations only count where the calendar shows them.
    <CalendarDayMarkersProvider includeReservations={!hideReservations}>
      <Calendar
        date={currentDate}
        onNavigate={setCurrentDate}
        localizer={localizer}
        culture="en-GB"
        defaultView="work_week"
        views={["work_week"]}
        step={30}
        //view={currentView}
        onView={setCurrentView}
        backgroundEvents={slots}
        events={hideReservations ? [] : reservations}
        startAccessor="start"
        endAccessor="end"
        selectable={addSlots}
        onSelectSlot={addSlots ? handleSelectSlot : undefined}
        onSelectEvent={addReservations ? handleSelectEvent : undefined}
        onRangeChange={handleRangeChange}
        components={calendarComponents}
        eventPropGetter={eventPropGetter}
        min={new Date(2025, 0, 0, 8, 0, 0, 0)}
        max={new Date(2025, 0, 0, 19, 0, 0, 0)}
      />
    </CalendarDayMarkersProvider>
  );
};

export default MyCalendar;
