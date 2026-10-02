import { useMemo, useState } from "react";
import {
  Title,
  useAuthenticated,
  useDataProvider,
  useGetList,
  useNotify,
} from "react-admin";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {
  BillingReports,
  CellFormat,
  HtmlReportSection,
  Row,
  cell,
  download,
  prettyColumn,
  toCsv,
  toHtmlReport,
  visibleColumns,
} from "../../services/billingReports";

/**
 * Billing reports.
 *
 * The figures a consuntivo is built from. The backend computes them — see
 * `/api/reports` — so this page chooses a period, narrows the result to the
 * projects and organizations of interest, and hands the tables over as CSV or
 * as one HTML report.
 *
 * The controls mirror the standalone billing app they replace, so that a
 * report produced here is the report people are used to reading.
 */

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const daysFromToday = (days: number) =>
  isoDay(new Date(Date.now() + days * 86_400_000));

/** A picker of names, with the select-all / clear pair the billing app had. */
const NameFilter = ({
  title,
  names,
  selected,
  onChange,
}: {
  title: string;
  names: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) => (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      {title}
    </Typography>
    <Stack direction="row" spacing={1} sx={{ my: 1 }}>
      <Button size="small" onClick={() => onChange(new Set(names))}>
        Select all
      </Button>
      <Button size="small" onClick={() => onChange(new Set())}>
        Clear
      </Button>
    </Stack>
    {names.length === 0 ? (
      <Typography variant="body2" color="text.secondary">
        None available
      </Typography>
    ) : (
      <Box sx={{ maxHeight: 220, overflowY: "auto", pr: 1 }}>
        {names.map((name) => (
          <FormControlLabel
            key={name}
            sx={{ display: "flex", alignItems: "flex-start", m: 0 }}
            control={
              <Checkbox
                size="small"
                sx={{ pt: 0 }}
                checked={selected.has(name)}
                onChange={(event) => {
                  const next = new Set(selected);
                  if (event.target.checked) next.add(name);
                  else next.delete(name);
                  onChange(next);
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                {name}
              </Typography>
            }
          />
        ))}
      </Box>
    )}
  </Box>
);

const ReportTable = ({
  title,
  rows,
  hideTechnical,
  filename,
  format,
}: {
  title: string;
  rows: Row[];
  hideTechnical: boolean;
  filename: string;
  format: CellFormat;
}) => {
  const columns = visibleColumns(rows, hideTechnical);
  return (
    <Box sx={{ mb: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography variant="h6">{title}</Typography>
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          disabled={rows.length === 0}
          onClick={() =>
            download(filename, toCsv(rows, columns, format), "text/csv")
          }
        >
          CSV
        </Button>
      </Stack>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          (no data)
        </Typography>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c} sx={{ fontWeight: "bold" }}>
                    {prettyColumn(c)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((c) => (
                    <TableCell key={c}>{cell(c, row[c], format)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export const ReportsPage = () => {
  useAuthenticated();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  // The billing app's defaults: a quarter back, a month forward.
  const [from, setFrom] = useState(daysFromToday(-90));
  const [to, setTo] = useState(daysFromToday(30));
  const [showOrgReports, setShowOrgReports] = useState(true);
  const [hideTechnical, setHideTechnical] = useState(false);
  const [roundToSecond, setRoundToSecond] = useState(false);
  const format: CellFormat = { roundToSecond };
  const [reports, setReports] = useState<BillingReports | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: projectRecords } = useGetList("projects", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "name", order: "ASC" },
  });
  const { data: organizationRecords } = useGetList("organizations", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "name", order: "ASC" },
  });

  const projectNames = useMemo(
    () => (projectRecords ?? []).map((r) => r.name as string).sort(),
    [projectRecords],
  );
  const organizationNames = useMemo(
    () => (organizationRecords ?? []).map((r) => r.name as string).sort(),
    [organizationRecords],
  );

  // Empty means "no narrowing", which is also how the billing app behaved
  // before anything was ticked.
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [selectedOrganizations, setSelectedOrganizations] = useState<
    Set<string>
  >(new Set());

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await dataProvider.getBillingReports(from, to);
      setReports(data as BillingReports);
    } catch (error) {
      notify(
        typeof error === "object" && error && "message" in error
          ? String((error as { message: unknown }).message)
          : "Could not generate the reports",
        { type: "error" },
      );
    } finally {
      setLoading(false);
    }
  };

  /** Narrowing is by name, the way the billing app filtered its frames. */
  const narrow = <T extends Row>(rows: T[]): T[] =>
    rows.filter((row) => {
      const project = row.project_name as string | null;
      const organization = row.organization_name as string | null;
      if (selectedProjects.size > 0 && project !== null) {
        if (!selectedProjects.has(project)) return false;
      }
      if (selectedOrganizations.size > 0 && organization !== null) {
        if (!selectedOrganizations.has(organization)) return false;
      }
      return true;
    });

  const sections: HtmlReportSection[] = useMemo(() => {
    if (!reports) return [];
    const all: (HtmlReportSection & { filename: string; orgLevel: boolean })[] =
      [
        {
          title: "Reservations — projects",
          rows: narrow(reports.reservations.by_project),
          filename: "reservation_durations_by_project.csv",
          orgLevel: false,
        },
        {
          title: "Reservations — organizations",
          rows: narrow(reports.reservations.by_organization),
          filename: "reservation_durations_by_org.csv",
          orgLevel: true,
        },
        {
          title: "Jobs — projects",
          rows: narrow(reports.jobs.by_project),
          filename: "project_job_durations.csv",
          orgLevel: false,
        },
        {
          title: "Jobs — organizations",
          rows: narrow(reports.jobs.by_organization),
          filename: "organization_job_durations.csv",
          orgLevel: true,
        },
        {
          title: "Slots — organizations",
          rows: narrow(reports.slots.by_organization),
          filename: "organization_slot_aggregations.csv",
          orgLevel: true,
        },
        {
          title: "Reservation usage — projects",
          rows: narrow(reports.utilization.by_project),
          filename: "reservation_usage_by_project.csv",
          orgLevel: false,
        },
      ];
    return all.filter((s) => showOrgReports || !s.orgLevel);
    // `narrow` closes over the selections, so they belong in the dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, showOrgReports, selectedProjects, selectedOrganizations]);

  return (
    <>
      <Title title="Billing reports" />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Card
          variant="outlined"
          sx={{
            // Fixed, not content-sized: with only a minimum, the longest label
            // stretched this column to roughly twice the width the controls
            // need, at the expense of the tables beside it. Full width when
            // the layout stacks on a narrow screen.
            width: { xs: "100%", md: 280 },
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Start date"
                type="date"
                size="small"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End date"
                type="date"
                size="small"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Typography variant="body2" color="text.secondary">
                A date means midnight UTC, and a row counts only if it falls
                entirely inside the period.
              </Typography>
              <Divider />
              <NameFilter
                title="Projects"
                names={projectNames}
                selected={selectedProjects}
                onChange={setSelectedProjects}
              />
              <Divider />
              <NameFilter
                title="Organizations"
                names={organizationNames}
                selected={selectedOrganizations}
                onChange={setSelectedOrganizations}
              />
              <Divider />
              <FormControlLabel
                sx={{ alignItems: "flex-start", m: 0 }}
                control={
                  <Checkbox
                    size="small"
                    sx={{ pt: 0 }}
                    checked={showOrgReports}
                    onChange={(e) => setShowOrgReports(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Enable organization reports
                  </Typography>
                }
              />
              <FormControlLabel
                // The label wraps to several lines at this width; keep the box
                // beside the first one rather than centred against the block.
                sx={{ alignItems: "flex-start", m: 0 }}
                control={
                  <Checkbox
                    size="small"
                    sx={{ pt: 0 }}
                    checked={hideTechnical}
                    onChange={(e) => setHideTechnical(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Hide technical columns (free_queue, organization_id,
                    project_id)
                  </Typography>
                }
              />
              <FormControlLabel
                sx={{ alignItems: "flex-start", m: 0 }}
                control={
                  <Checkbox
                    size="small"
                    sx={{ pt: 0 }}
                    checked={roundToSecond}
                    onChange={(e) => setRoundToSecond(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Round durations to the second (off: milliseconds, which is
                    what billing counts)
                  </Typography>
                }
              />
            </Stack>
          </CardContent>
        </Card>

        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={generate}
              disabled={loading || from >= to}
            >
              {loading ? "Generating…" : "Generate reports"}
            </Button>
            {reports && (
              <Button
                startIcon={<DownloadIcon />}
                onClick={() =>
                  download(
                    "lagrange_billing_report.html",
                    toHtmlReport(sections, reports.period, hideTechnical, format),
                    "text/html",
                  )
                }
              >
                Full HTML report
              </Button>
            )}
            {from >= to && (
              <Typography variant="body2" color="error">
                The start date must come before the end date.
              </Typography>
            )}
          </Stack>

          {!reports ? (
            <Typography variant="body2" color="text.secondary">
              Choose a period and generate the reports.
            </Typography>
          ) : (
            sections.map((section) => (
              <ReportTable
                key={section.title}
                title={section.title}
                rows={section.rows}
                hideTechnical={hideTechnical}
                format={format}
                filename={
                  (section as HtmlReportSection & { filename: string }).filename
                }
              />
            ))
          )}
        </Box>
      </Stack>
    </>
  );
};

export default ReportsPage;
