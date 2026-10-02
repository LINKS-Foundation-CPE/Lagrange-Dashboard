import { useRecordContext } from "react-admin";
import { Box } from "@mui/material";
import { formatSeconds } from "../utils";

/**
 * How much QPU time a job actually used: `execution_end − execution_start`.
 *
 * Not a field on the record — the backend stores the two timestamps and derives
 * the amount from them, so the table derives it the same way rather than
 * inventing a second source of truth.
 *
 * Always seconds with three decimals — `1.018s`, never `1s 18ms`. A column of
 * execution times that switches unit with magnitude cannot be scanned: two rows
 * an order of magnitude apart stop being comparable at a glance. Three decimals
 * is the granularity billing runs at, and the unit the billing reports use.
 */
export const JobDurationField = () => {
  const record = useRecordContext();
  const start = record?.execution_start
    ? new Date(record.execution_start).getTime()
    : NaN;
  const end = record?.execution_end
    ? new Date(record.execution_end).getTime()
    : NaN;

  // A job that never ran, and one whose window ends before it starts, are both
  // shown as a dash: that is what the platform counts for them. The muted dash
  // rather than an empty cell is the same signal the artifact buttons use — it
  // says "nothing here", not "something failed to render".
  const usable = Number.isFinite(start) && Number.isFinite(end) && end >= start;

  return usable ? (
    <span>{formatSeconds(end - start)}</span>
  ) : (
    <Box component="span" sx={{ color: "text.disabled" }}>
      —
    </Box>
  );
};
