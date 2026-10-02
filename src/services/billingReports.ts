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

export interface UtilizationReportRow extends ReportRow {
  usage_hours: number;
  reserved_hours: number;
  utilization: number | null;
}

export interface BillingReports {
  period: { from: string; to: string };
  reservations: { by_project: ReportRow[]; by_organization: ReportRow[] };
  jobs: { by_project: ReportRow[]; by_organization: ReportRow[] };
  slots: { by_organization: ReportRow[] };
  utilization: { by_project: UtilizationReportRow[] };
}

/**
 * Columns the report can be asked to leave out. Same set the Streamlit app
 * offered, minus `past_count`/`future_count`, which no longer exist.
 */
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
  return `<div class='section'><h2>${escapeHtml(title)}</h2><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
};

export interface HtmlReportSection {
  title: string;
  rows: Row[];
}

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
      htmlTable(s.title, s.rows, visibleColumns(s.rows, hideTechnical), format),
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
