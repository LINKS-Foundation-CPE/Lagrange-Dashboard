import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Badge, Box, Button, ButtonGroup, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import type { PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { DateTime } from "luxon";
import type { ToolbarProps, View, ViewsProps } from "react-big-calendar";
import { useCalendarDayMarkers } from "../../hooks/useCalendarDayMarkers";

/**
 * Toolbar for the reservations and slots calendars.
 *
 * It replaces react-big-calendar's stock toolbar for two reasons. The obvious
 * one is that the stock toolbar offers only Back / Today / Next, so a date a
 * few months out costs a dozen clicks — allocated slots are planned well ahead,
 * and that is exactly the navigation people need. The second is that the stock
 * toolbar renders bare `<button>` elements styled by react-big-calendar's own
 * CSS, which ignores the Lagrange theme; rebuilding it out of MUI components
 * puts the accent colour and the sentence-case buttons back.
 *
 * The date jump is expressed as `onNavigate("DATE", ...)`, react-big-calendar's
 * own navigation action, so the calendar recomputes its visible range and fires
 * `onRangeChange` exactly as Back and Next do — the data fetch follows for free.
 */

/**
 * The dots on the picker come from a query the *calendar* owns, because only it
 * knows whether reservations are in scope, and they reach the toolbar through
 * context rather than through props.
 *
 * That is not indirection for its own sake. react-big-calendar takes the
 * toolbar as a component *type*, so passing data down would mean building the
 * component inside the calendar's render — a new type on every change, which
 * React unmounts and remounts. The picker lives inside the toolbar, so the
 * popper would close the instant the month's data arrived: precisely when it is
 * open. A stable component reading a changing context keeps the popper alive.
 */
type DayMarkers = {
  markedDays?: Set<string>;
  loadingMarkers: boolean;
  onMonthChange: (month: DateTime) => void;
};

const DayMarkersContext = createContext<DayMarkers | null>(null);

/**
 * Supplies the toolbar's date picker with the days that carry an entry.
 * Without it the picker still works — it simply shows no dots.
 */
export const CalendarDayMarkersProvider = ({
  includeReservations,
  children,
}: {
  includeReservations: boolean;
  children: ReactNode;
}) => {
  const [month, setMonth] = useState(() => DateTime.now().startOf("month"));
  const { markedDays, loadingMarkers } = useCalendarDayMarkers(
    month,
    includeReservations,
  );
  const value = useMemo(
    () => ({ markedDays, loadingMarkers, onMonthChange: setMonth }),
    [markedDays, loadingMarkers],
  );
  return (
    <DayMarkersContext.Provider value={value}>
      {children}
    </DayMarkersContext.Provider>
  );
};

/** A day cell with a dot under it when that day carries a slot or reservation. */
const MarkedDay = ({
  markedDays,
  day,
  outsideCurrentMonth,
  ...rest
}: PickersDayProps & { markedDays?: Set<string> }) => {
  const iso = day.toISODate();
  // Days spilling in from the neighbouring months are not part of the range
  // that was queried, so marking them would be a guess.
  const marked = !outsideCurrentMonth && !!iso && !!markedDays?.has(iso);
  return (
    <Badge
      overlap="circular"
      variant="dot"
      color="primary"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      invisible={!marked}
    >
      <PickersDay
        {...rest}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
      />
    </Badge>
  );
};

/**
 * `views` reaches the toolbar either as an array or as a map of view name to
 * `true`/component; flatten both to the list of enabled names.
 */
function enabledViews<TEvent extends object, TResource extends object>(
  views: ViewsProps<TEvent, TResource>,
): View[] {
  if (Array.isArray(views)) return views;
  return (Object.entries(views) as Array<[View, unknown]>)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([name]) => name);
}

// Generic in the event/resource types so it stays assignable to whatever
// `Components<TEvent, TResource>` the calendar it is handed to infers.
const CalendarToolbar = <TEvent extends object, TResource extends object>({
  date,
  view,
  views,
  label,
  localizer,
  onNavigate,
  onView,
}: ToolbarProps<TEvent, TResource>) => {
  const handlePickDate = useCallback(
    (picked: DateTime | null) => {
      // The picker fires on every keystroke of typed input, so most
      // intermediate values are incomplete and unparseable.
      if (!picked?.isValid) return;
      onNavigate("DATE", picked.toJSDate());
    },
    [onNavigate],
  );

  const markers = useContext(DayMarkersContext);
  const viewNames = enabledViews(views);

  /**
   * Stable identity for the picker's value, and it has to be.
   *
   * `DateCalendar` runs `useEffect(… setVisibleDate({ target: value }) …, [value])`
   * — a **reference** comparison. Building the DateTime inline handed it a new
   * object on every render, so any re-render while the popper was open snapped
   * the displayed month back to the selected date's month. That is what made the
   * month arrows animate and then land where they started: clicking one fires
   * `onMonthChange`, which updates the marker month, which re-renders this
   * toolbar, which recreated the value.
   */
  const dateMs = date.getTime();
  const pickerValue = useMemo(() => DateTime.fromMillis(dateMs), [dateMs]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        mb: 2,
      }}
    >
      <ButtonGroup size="small" variant="outlined" color="primary">
        <Button startIcon={<TodayIcon />} onClick={() => onNavigate("TODAY")}>
          {localizer.messages.today}
        </Button>
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={() => onNavigate("PREV")}
        >
          {localizer.messages.previous}
        </Button>
        <Button
          endIcon={<ChevronRightIcon />}
          onClick={() => onNavigate("NEXT")}
        >
          {localizer.messages.next}
        </Button>
      </ButtonGroup>

      <Typography
        variant="h4"
        component="h2"
        sx={{ flex: "1 1 auto", textAlign: "center", color: "text.primary" }}
      >
        {label}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <DatePicker
          label="Jump to date"
          value={pickerValue}
          onChange={handlePickDate}
          // The calendar is rendered with culture="en-GB"; state the format
          // rather than relying on the browser locale, so the field a user
          // types into always matches the dates shown in the grid.
          format="dd/MM/yyyy"
          // A dot marks a day that already carries a slot or a reservation, so
          // the month can be read for availability before jumping into it.
          onMonthChange={(month) => markers?.onMonthChange(month)}
          loading={markers?.loadingMarkers ?? false}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{ day: MarkedDay }}
          slotProps={{
            textField: { size: "small", sx: { width: 190 } },
            day: { markedDays: markers?.markedDays } as never,
          }}
        />
      </LocalizationProvider>

      {/* Only one view is enabled today, but keep the switcher so enabling
          another does not silently lose it. */}
      {viewNames.length > 1 && (
        <ButtonGroup size="small" variant="outlined" color="primary">
          {viewNames.map((name) => (
            <Button
              key={name}
              variant={name === view ? "contained" : "outlined"}
              onClick={() => onView(name)}
            >
              {localizer.messages[name]}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </Box>
  );
};

export default CalendarToolbar;
