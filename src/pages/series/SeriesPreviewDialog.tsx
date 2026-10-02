import { DateTime } from "luxon";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatDuration } from "../utils";
import { SeriesResult } from "./recurrence";

interface Props {
  kind: "slots" | "reservations";
  result: SeriesResult | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (skipConflicts: boolean) => void;
}

const when = (iso: string, fmt: string) => DateTime.fromISO(iso).toFormat(fmt);

/**
 * Every occurrence of a series before it is created, and why any of them
 * cannot be. The user then creates all of it, creates the rest without the
 * conflicting ones, or goes back — nothing is half-created behind their back.
 */
export const SeriesPreviewDialog = ({ kind, result, busy, onCancel, onConfirm }: Props) => {
  if (!result) return null;
  const { summary, occurrences } = result;
  const noun = kind === "slots" ? "slot" : "reservation";
  const blocked = Boolean(summary.budget_problem) || summary.ok === 0;

  return (
    <Dialog open onClose={busy ? undefined : onCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        {summary.total} {noun}
        {summary.total === 1 ? "" : "s"}
        {summary.conflicts > 0 ? `, ${summary.conflicts} can't be created` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {summary.cost_ms != null && (
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Cost {formatDuration(summary.cost_ms)} of QPU time, from{" "}
            {formatDuration(summary.remaining_budget_ms ?? 0)} remaining on the project.
          </Typography>
        )}
        {summary.budget_problem && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {summary.budget_problem}
          </Alert>
        )}
        {result.outcome === "refused" && result.message && !summary.budget_problem && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            {result.message}
          </Alert>
        )}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {occurrences.map((o) => (
              <TableRow key={o.start}>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{when(o.start, "ccc d LLL yyyy")}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  {when(o.start, "HH:mm")}–{when(o.end, "HH:mm")}
                </TableCell>
                <TableCell sx={{ color: o.problem ? "error.main" : "success.main" }}>
                  {o.problem ?? "OK"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        {busy && <CircularProgress size={20} sx={{ mr: 1 }} />}
        <Button onClick={onCancel} disabled={busy}>
          Back
        </Button>
        {!blocked && summary.conflicts === 0 && (
          <Button variant="contained" onClick={() => onConfirm(false)} disabled={busy}>
            Create {summary.ok}
          </Button>
        )}
        {!blocked && summary.conflicts > 0 && (
          <Button variant="contained" onClick={() => onConfirm(true)} disabled={busy}>
            Create {summary.ok}, skip {summary.conflicts}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
