import { Duration } from "luxon";

/**
 * A duration as seconds with three decimals — `1.018s`, not `1s 18ms`.
 *
 * Fixed unit on purpose, unlike `formatDuration`, which switches between hours,
 * minutes, seconds and milliseconds as the magnitude changes. For a column of
 * execution times that switching is the problem: two rows an order of magnitude
 * apart render in different units and cannot be compared at a glance. Three
 * decimals is the granularity billing runs at, and the unit the billing reports
 * already use.
 */
export const formatSeconds = (ms: number) => {
  if (ms == null || !Number.isFinite(ms)) return "";
  return `${(ms / 1000).toFixed(3)}s`;
};

export const formatDuration = (ms: number) => {
  if (ms == null) return "";

  const negative = ms < 0;
  const d = Duration.fromMillis(Math.abs(ms)).shiftTo("hours", "minutes", "seconds", "milliseconds");

  const parts = [
    d.hours ? `${d.hours}h` : "",
    d.minutes ? `${d.minutes}m` : "",
    d.seconds ? `${d.seconds}s` : "",
    d.milliseconds ? `${d.milliseconds}ms` : "",
  ].filter(Boolean); // remove empty strings

  return (negative ? "-" : "") + (parts.length > 0 ? parts.join(" ") : "0ms");
};

const combineDateAndTime = (day, timePart) => {
    const date = new Date(day);
    const time = new Date(timePart);

    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date.toISOString();
};

const transformDateTimes = (data) => {
    const { start, end } = data;
    let { day } = data;
    if (typeof day.getMonth === 'function') {
      day = day.toISOString().split('T')[0]
    }

    return {
        ...data,
        day,
        start: combineDateAndTime(day, start),
        end: combineDateAndTime(day, end),
    };
};

export {transformDateTimes, combineDateAndTime}