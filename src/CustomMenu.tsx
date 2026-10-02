import { Menu } from "react-admin";
import { Box, Typography } from "@mui/material";
import CalendarIcon from "@mui/icons-material/Event";
import FolderIcon from "@mui/icons-material/Folder";
import BookIcon from "@mui/icons-material/Book";
import PeopleIcon from "@mui/icons-material/People";
import TerminalIcon from "@mui/icons-material/Terminal";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import ViewListIcon from "@mui/icons-material/ViewList";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useBackendToken } from "./hooks/useBackendToken";
import { useConfig } from "./hooks/useConfig";
import {
  DOCS_URL,
  MACHINE_METRICS_URL,
  MACHINE_STATUS_URL,
} from "./services/embeddedPanels";

export const CustomMenu = () => {
  const decodedToken = useBackendToken();
  const { slotConstrainedReservations } = useConfig();

  if (!decodedToken) {
    return <div>Loading...</div>;
  }

  const roles: string[] = decodedToken.roles || [];
  const isAdmin = roles.includes("admin");
  const isReadOnlyAdmin = roles.includes("readOnlyAdmin");
  const isOrgManager = roles.includes("organization-manager");
  const isProjectAdmin = roles.includes("project-admin");
  const isOrgAuditor = roles.includes("organization-auditor");

  // Platform-wide read/write admins: they see the fully-scoped admin items.
  const isPlatformAdmin = isAdmin || isReadOnlyAdmin;

  // The admin section is shown to anyone with some administrative capability:
  // platform admins, org managers (org-scoped) and PIs (project-scoped).
  const showAdminSection =
    isAdmin || isReadOnlyAdmin || isOrgManager || isProjectAdmin;

  // Projects item: platform admins, org managers and PIs. The backend
  // `administrable=true` filter scopes the rows (admin=all, org-manager=their
  // org, PI=their administered projects).
  const showProjects =
    isAdmin || isReadOnlyAdmin || isOrgManager || isProjectAdmin;

  // Users item: platform admins and org managers only.
  const showUsers = isAdmin || isReadOnlyAdmin || isOrgManager;

  // Billing reports: platform admins see every organization; managers and
  // auditors are scoped to their own by the backend. Not PIs — a project's
  // consumption is the budget ledger, not an accounting report.
  const showReports = isPlatformAdmin || isOrgManager || isOrgAuditor;

  // Reservations, list and calendar. Both sit in the Admin section: they are
  // administrative views of everything the caller may reach, not a personal
  // view like My Projects. Project admins and above — a PI sees the projects
  // they administer, an org manager their organization, an admin everything,
  // and the backend does the scoping. Read-only platform and organization roles
  // are deliberately not here, matching the gate the calendar has always had.
  const showReservations = isAdmin || isOrgManager || isProjectAdmin;

  // Slot-less reservations => hide both slots items in the admin section.
  const slotLess = slotConstrainedReservations === false;

  return (
    <Menu
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        // On a short screen the item list is taller than the viewport. Without
        // these the overflow is simply cut: the admin section's last items and
        // the logos below them are unreachable, with no scrollbar to say so.
        // `minHeight: 0` is what lets a flex child scroll at all — the default
        // `auto` refuses to shrink below its content.
        minHeight: 0,
        overflowY: "auto",
      }}
    >
      {/* Common section: no header, shown to everyone. */}
      <Menu.DashboardItem />
      <Menu.Item
        to="/my-projects"
        primaryText="My Projects"
        leftIcon={<FolderIcon />}
      />
      <Menu.Item
        to="/my-jobs"
        primaryText="My Jobs"
        leftIcon={<TerminalIcon />}
      />
      {/* Sibling monitoring pages, embedded. Shown to every signed-in user,
          and only where the deployment configured a URL for them. */}
      {MACHINE_STATUS_URL && (
        <Menu.Item
          to="/machine-status"
          primaryText="Machine Status"
          leftIcon={<MonitorHeartIcon />}
        />
      )}
      {MACHINE_METRICS_URL && (
        <Menu.Item
          to="/machine-metrics"
          primaryText="Machine Metrics"
          leftIcon={<InsightsIcon />}
        />
      )}
      {/* Documentation opens in a new tab instead of a route: it is a separate
          site, not a panel. `component`/`href` override MenuItemLink's router
          link, which keeps the item's styling and its collapsed-sidebar
          tooltip; `to` only satisfies the required prop. */}
      {DOCS_URL && (
        <Menu.Item
          to={DOCS_URL}
          component="a"
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          primaryText="Documentation"
          leftIcon={<MenuBookIcon />}
        />
      )}

      {/* Admin section: labelled header, shown to any administrative role. */}
      {showAdminSection && (
        <>
          <Box sx={{ px: 2, pt: 2, pb: 0.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Admin
            </Typography>
          </Box>
          {showReservations && (
            <Menu.Item
              to="/reservations"
              primaryText="Reservations"
              leftIcon={<BookOnlineIcon />}
            />
          )}
          {showReservations && (
            <Menu.Item
              to="/reservations-calendar"
              primaryText="Reservations Calendar"
              leftIcon={<CalendarIcon />}
            />
          )}
          {showProjects && (
            <Menu.Item
              to="/projects"
              primaryText="Projects"
              leftIcon={<BookIcon />}
            />
          )}
          {showUsers && (
            <Menu.Item
              to="/users"
              primaryText="Users"
              leftIcon={<PeopleIcon />}
            />
          )}
          {isPlatformAdmin && (
            <Menu.Item
              to="/jobs"
              primaryText="All Jobs"
              leftIcon={<TerminalIcon />}
            />
          )}
          {isPlatformAdmin && !slotLess && (
            <Menu.Item
              to="/slots"
              primaryText="Allocated slots"
              leftIcon={<WorkHistoryIcon />}
            />
          )}
          {isPlatformAdmin && !slotLess && (
            <Menu.Item
              to="/slots-calendar"
              primaryText="Slots Calendar"
              leftIcon={<CalendarIcon />}
            />
          )}
          {isPlatformAdmin && (
            <Menu.Item
              to="/organizations"
              primaryText="Organizations"
              leftIcon={<CorporateFareIcon />}
            />
          )}
          {showReports && (
            <Menu.Item
              to="/reports"
              primaryText="Billing reports"
              leftIcon={<ReceiptLongIcon />}
            />
          )}
          {/* The tag vocabulary is admin-defined; a PI assigns from it on a
              project's Tags tab rather than here. */}
          {isPlatformAdmin && (
            <Menu.Item to="/tags" primaryText="Tags" leftIcon={<LocalOfferIcon />} />
          )}
          {isPlatformAdmin && (
            <Menu.Item to="/logs" primaryText="Logs" leftIcon={<ViewListIcon />} />
          )}
          {isPlatformAdmin && (
            <Menu.Item
              to="/announcements"
              primaryText="Announcements"
              leftIcon={<CampaignIcon />}
            />
          )}
        </>
      )}

    </Menu>
  );
};
