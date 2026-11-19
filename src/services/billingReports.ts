/**
 * Billing report shapes and exports.
 *
 * The rows come from `/api/reports/*`, which computes them in SQL; nothing is
 * aggregated here. What this module owns is presentation: which columns are
 * shown, and the CSV and HTML a report is handed over as.
 */

export interface ReportRow {
  id: number;
  project_id: number | null;
  project_name: string | null;
  free_queue: boolean | null;
  organization_id: number | null;
  organization_name: string | null;
  count: number;
  total_seconds: number;
  total_hours: number;
}

/**
 * A reservations row, split at 24 hours from now by start time: past blocks
 * (used, or too close to give back) and future ones (booked, not yet used).
 * Past and future add up to `count` and `total_*`.
 */
export interface ReservationReportRow extends ReportRow {
  past_count: number;
  past_seconds: number;
  past_hours: number;
  future_count: number;
  future_seconds: number;
  future_hours: number;
}

export interface UtilizationReportRow extends ReportRow {
  usage_hours: number;
  reserved_hours: number;
  utilization: number | null;
}

export interface BillingReports {
  period: { from: string; to: string };
  reservations: {
    by_project: ReservationReportRow[];
    by_organization: ReservationReportRow[];
  };
  jobs: { by_project: ReportRow[]; by_organization: ReportRow[] };
  slots: { by_organization: ReportRow[] };
  utilization: { by_project: UtilizationReportRow[] };
}

/** Columns the report can be asked to leave out. Same set the Streamlit app offered. */
const TECHNICAL_COLUMNS = ["free_queue", "organization_id", "project_id"];

/** `id` is the grouping key react-admin needs; it is never part of a report. */
const ALWAYS_HIDDEN = ["id"];

export type Row = Record<string, unknown>;

export const visibleColumns = (rows: Row[], hideTechnical: boolean): string[] => {
  if (rows.length === 0) return [];
  const hidden = new Set(
    hideTechnical ? [...ALWAYS_HIDDEN, ...TECHNICAL_COLUMNS] : ALWAYS_HIDDEN,
  );
  return Object.keys(rows[0]).filter((c) => !hidden.has(c));
};

/** Underscores read badly in a table header. */
export const prettyColumn = (column: string) => column.replace(/_/g, " ");

/**
 * Three decimals on a duration column.
 *
 * Billing runs to the millisecond, and three decimals of a second is exactly
 * that — so the default loses nothing. Counts and identifiers are integers and
 * are printed as they are.
 */
const DECIMALS = 3;
const SECONDS_COLUMN = /_seconds$/;
const HOURS_COLUMN = /_hours$/;

export interface CellFormat {
  /**
   * Round durations to whole seconds.
   *
   * Off by default: the ledger is denominated in milliseconds and a report
   * meant to be reconciled against it should not quietly disagree. On, for a
   * report meant to be read rather than reconciled.
   */
  roundToSecond: boolean;
}

export const DEFAULT_FORMAT: CellFormat = { roundToSecond: false };

const formatNumber = (
  column: string,
  value: number,
  { roundToSecond }: CellFormat,
): string => {
  if (SECONDS_COLUMN.test(column)) {
    return roundToSecond ? String(Math.round(value)) : value.toFixed(DECIMALS);
  }
  if (HOURS_COLUMN.test(column)) {
    // Hours and seconds must tell the same story in one row, so when durations
    // are rounded the hours are derived from the rounded seconds rather than
    // rounded independently.
    const hours = roundToSecond ? Math.round(value * 3600) / 3600 : value;
    return hours.toFixed(DECIMALS);
  }
  // A ratio, not a duration: rounding to the second means nothing here.
  if (column === "utilization") return value.toFixed(DECIMALS);
  return String(value);
};

export const cell = (
  column: string,
  value: unknown,
  format: CellFormat = DEFAULT_FORMAT,
): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return formatNumber(column, value, format);
  return String(value);
};

/** Counts and durations add up; identifiers and flags do not. */
const SUMMABLE = (column: string) =>
  column === "count" ||
  column.endsWith("_count") ||
  SECONDS_COLUMN.test(column) ||
  HOURS_COLUMN.test(column);

/**
 * The totals row of a table, over the rows it shows (so it follows the project
 * and organization filters). Counts and durations are summed; utilization is
 * recomputed from the summed hours rather than averaged, since an average of
 * ratios would weigh a one-hour block like a full day. "Total" goes in the
 * first column that is not summed.
 */
export const totalsRow = (rows: Row[], columns: string[]): Row => {
  const total: Row = {};
  for (const c of columns) {
    if (SUMMABLE(c)) {
      total[c] = rows.reduce(
        (sum, row) => sum + (typeof row[c] === "number" ? (row[c] as number) : 0),
        0,
      );
    }
  }
  if (columns.includes("utilization")) {
    const reserved = (total.reserved_hours as number | undefined) ?? 0;
    const used = (total.usage_hours as number | undefined) ?? 0;
    total.utilization = reserved > 0 ? used / reserved : null;
  }
  const label = columns.find((c) => !(c in total));
  if (label) total[label] = "Total";
  return total;
};

const csvCell = (column: string, value: unknown, format: CellFormat): string => {
  const text = cell(column, value, format);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (
  rows: Row[],
  columns: string[],
  format: CellFormat = DEFAULT_FORMAT,
): string =>
  [
    columns.join(","),
    ...rows.map((row) =>
      columns.map((c) => csvCell(c, row[c], format)).join(","),
    ),
  ].join("\n");

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const htmlTable = (
  title: string,
  rows: Row[],
  columns: string[],
  format: CellFormat,
  note?: string,
): string => {
  if (rows.length === 0) {
    return `<div class='section'><h2>${escapeHtml(title)}</h2><div>(no data)</div></div>`;
  }
  const head = columns
    .map((c) => `<th>${escapeHtml(prettyColumn(c))}</th>`)
    .join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${escapeHtml(cell(c, row[c], format))}</td>`).join("")}</tr>`,
    )
    .join("");
  const totals = totalsRow(rows, columns);
  const foot = `<tr>${columns.map((c) => `<td>${escapeHtml(cell(c, totals[c], format))}</td>`).join("")}</tr>`;
  const caption = note ? `<p class='note'>${escapeHtml(note)}</p>` : "";
  return `<div class='section'><h2>${escapeHtml(title)}</h2>${caption}<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table></div>`;
};

export interface HtmlReportSection {
  title: string;
  rows: Row[];
  /** A line under the title, for a table whose columns need explaining. */
  note?: string;
}

/** What "past" and "future" mean in the reservation tables. */
export const PAST_FUTURE_NOTE =
  "Past: reservations already used or starting within 24 hours of when the report was generated. Future: booked, starting later. Past and future add up to the totals.";

/**
 * The combined report, in the shape the billing app produced it — one file,
 * one section per table, period and generation date in the heading.
 */
export const toHtmlReport = (
  sections: HtmlReportSection[],
  period: { from: string; to: string },
  hideTechnical: boolean,
  format: CellFormat = DEFAULT_FORMAT,
  notes = "",
): string => {
  const css = `
    <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin: 20px; color: #111; }
    h1 { color: #0b5cff; }
    .section { margin-bottom: 28px; }
    table { border-collapse: collapse; width: 100%; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f6f8fb; }
    tfoot td { font-weight: bold; background: #f6f8fb; }
    .note { font-size: 0.85rem; color: #555; margin: 4px 0; }
    .notes { font-size: 0.9rem; color: #333; background: #fcfcfe; padding: 10px; border: 1px solid #eee; }
    </style>`;

  const day = (iso: string) => iso.slice(0, 10);
  const generated = new Date().toISOString().slice(0, 10);

  return [
    "<html><head><meta charset='utf-8'/>",
    css,
    "</head><body>",
    `<h1>Lagrange Billing — Report <small style='font-size:0.8rem;color:#666;'>${day(period.from)} → ${day(period.to)} | generated: ${generated}</small></h1>`,
    ...sections.map((s) =>
      htmlTable(s.title, s.rows, visibleColumns(s.rows, hideTechnical), format, s.note),
    ),
    notes ? `<div class='notes'>${escapeHtml(notes)}</div>` : "",
    "</body></html>",
  ].join("\n");
};

/** Hands a generated file to the browser without a round trip to the server. */
export const download = (filename: string, content: string, mime: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
