import { useState } from "react";
import DownloadIcon from "@mui/icons-material/GetApp";
import {
  Button,
  downloadCSV,
  useDataProvider,
  useListContext,
  useNotify,
} from "react-admin";

/**
 * The columns the export writes, in this order.
 *
 * An explicit list rather than whatever fields the API happened to return, for
 * two reasons. The column order stays predictable as the API grows, and — the
 * reason this list exists at all — it leaves out `submitted_circuit` and
 * `results`. Those are full artifact URLs of about 127 characters each, and at
 * the size this table has reached they were **63% of the file**: a whole-table
 * export is 311 MB with them and 116 MB without. They are reconstructible from
 * the job id and the owner, so the export carries the id instead.
 */
const COLUMNS = [
  "id",
  "jobid",
  "organization_id",
  "project_id",
  "user_id",
  "job_type",
  "status",
  "submitted_datetime",
  "execution_start",
  "execution_end",
  "usedReservation",
] as const;

/** Rows per request. Large enough that a normal export is a few round trips. */
const PAGE_SIZE = 20_000;

/**
 * The most rows this will build in the browser.
 *
 * Measured with the columns above: 200,000 rows is a 29 MB file and about
 * 230 MB of peak heap, which a tab carries comfortably. The whole table —
 * roughly 800,000 jobs — is 116 MB and over 500 MB of heap, and that is before
 * the Blob the download needs. Exporting everything wants the server to stream
 * it; that is a different piece of work, and until it exists this refuses
 * rather than wedging the browser half way through.
 */
const MAX_ROWS = 200_000;

/** Minimal RFC 4180 quoting. */
const cell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * CSV export for the job lists.
 *
 * react-admin's own `<ExportButton>` fetches a single page of `maxResults`
 * rows and defaults that to 1000, so every export stopped after a thousand
 * jobs — a 1001-line file counting the header — with nothing to say the rest
 * had been left behind. This pages through the whole result set instead.
 *
 * The backend imposes no ceiling of its own: `utils/query.ts` turns the
 * requested range straight into `limit`/`offset`. The ceiling here is the
 * browser's.
 */
export const JobsExportButton = () => {
  const { resource, sort, filter, filterValues, total } = useListContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [running, setRunning] = useState(false);

  const handleClick = async () => {
    // Said before starting, not discovered at 500 MB. The list already knows
    // how many rows match, so the user can narrow the filter instead.
    if ((total ?? 0) > MAX_ROWS) {
      notify(
        `${total!.toLocaleString()} jobs match — too many to export from the browser. ` +
          `Narrow the filters to ${MAX_ROWS.toLocaleString()} or fewer.`,
        { type: "warning", autoHideDuration: 8000 },
      );
      return;
    }

    setRunning(true);
    try {
      // The permanent `filter` prop last, exactly as react-admin's own export
      // does it: "My Jobs" passes `filter={{ user_id }}` and a user-supplied
      // filter value must not be able to widen it to everybody's jobs.
      const effectiveFilter = filter
        ? { ...filterValues, ...filter }
        : filterValues;

      const chunks: string[] = [COLUMNS.join(",")];
      let rows = 0;
      for (let page = 1; rows < MAX_ROWS; page++) {
        const { data } = await dataProvider.getList(resource, {
          sort,
          filter: effectiveFilter,
          pagination: { page, perPage: PAGE_SIZE },
        });
        chunks.push(
          data
            .map((record: Record<string, unknown>) =>
              COLUMNS.map((column) => cell(record[column])).join(","),
            )
            .join("\r\n"),
        );
        rows += data.length;
        // A short page is the end of the data. Checking that rather than the
        // reported total also copes with rows arriving while the export runs.
        if (data.length < PAGE_SIZE) break;
      }

      if (rows === 0) {
        notify("Nothing to export", { type: "info" });
        return;
      }
      downloadCSV(
        chunks.join("\r\n"),
        `${resource}-${new Date().toISOString().slice(0, 10)}`,
      );
    } catch (error) {
      console.error("Job export failed", error);
      notify("Export failed", { type: "error" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button
      label={running ? "Exporting…" : "Export"}
      onClick={handleClick}
      disabled={running || total === 0}
    >
      <DownloadIcon />
    </Button>
  );
};
