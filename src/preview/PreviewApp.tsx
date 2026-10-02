import { Admin, CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router-dom";
import { Box } from "@mui/material";
import { Layout } from "../Layout";
import { lagrangeTheme } from "../theme/lagrangeTheme";
import { fakeDataProvider } from "./fakeDataProvider";
import {
  JobsList,
  PreviewCreate,
  PreviewDashboard,
  PreviewEdit,
  PreviewList,
  PreviewShow,
} from "./PreviewViews";
import tags from "../pages/tags";
import { MachineStatus } from "../pages/machine-status";
import { MachineMetrics } from "../pages/machine-metrics";

/**
 * Theme preview harness.
 *
 * Runs the real Layout — and therefore the real CustomAppBar and CustomMenu —
 * over generic views and an in-memory data provider, so what you are judging
 * is the actual chrome rather than a mock-up of it. No authProvider: the
 * preview is not a login flow.
 */

const generic = {
  list: PreviewList,
  edit: PreviewEdit,
  create: PreviewCreate,
  show: PreviewShow,
};

// The resources CustomMenu links to, so every menu item lands somewhere.
const RESOURCES = [
  "projects",
  "users",
  "organizations",
  "slots",
  "reservations",
  "announcements",
  "notifications",
  "logs",
  "projects_users",
  "organization-roles",
];

export const PreviewApp = () => {
  return (
    <>
      <Box>
        <Admin
          dataProvider={fakeDataProvider}
          layout={Layout}
          dashboard={PreviewDashboard}
          theme={lagrangeTheme}
          darkTheme={null}
          disableTelemetry
        >
          {RESOURCES.map((name) => (
            <Resource key={name} name={name} {...generic} />
          ))}
          <Resource name="jobs" list={JobsList} show={PreviewShow} />
          {/* The real tag screens, not a generic stand-in: they are small
              enough to run on the fake provider unchanged. */}
          <Resource name="tags" {...tags} />
          <CustomRoutes>
            <Route path="/my-projects" element={<PreviewList />} />
            <Route path="/my-jobs" element={<JobsList />} />
            <Route path="/reports" element={<PreviewDashboard />} />
            <Route path="/profile" element={<PreviewDashboard />} />
            <Route path="/reservations-calendar" element={<PreviewDashboard />} />
            <Route path="/machine-status" element={<MachineStatus />} />
            <Route path="/machine-metrics" element={<MachineMetrics />} />
          </CustomRoutes>
        </Admin>
      </Box>
    </>
  );
};
