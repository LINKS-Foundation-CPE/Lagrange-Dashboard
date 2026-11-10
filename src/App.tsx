import { Admin, CustomRoutes, Resource } from "react-admin";
import { Route } from "react-router";

import { Layout } from "./Layout";
import dataProvider from "./dataProvider";
import authProvider, { LoginPage } from "./authProvider";

import { Dashboard } from "./pages/dashboard/Dashboard";
import Calendar from "./pages/calendar";
import organizations from "./pages/organizations";
import projects from "./pages/projects";
import users from "./pages/users";
import slots from "./pages/slots";
import jobs from "./pages/jobs";
import reservations from "./pages/reservations";
import { UserList } from "./pages/users/UserList";
import { ProjectList } from "./pages/projects/ProjectList";
import logs from "./pages/actionlogs";
import organizationRoles from "./pages/organization-roles";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { ProjectUserCreate } from "./pages/projects/ProjectUserBulkCreate";
import announcements from "./pages/announcements";
import tags from "./pages/tags";
import notifications from "./pages/notifications";
import { useBackendToken } from "./hooks/useBackendToken";
import { useConfig } from "./hooks/useConfig";
import Profile from "./pages/profile";
import { MyProjects } from "./pages/my-projects/MyProjects";
import { MyJobs } from "./pages/my-jobs/MyJobs";
import { ReportsPage } from "./pages/reports";
import { lagrangeTheme } from "./theme/lagrangeTheme";
import { MachineStatus } from "./pages/machine-status";
import { MachineMetrics } from "./pages/machine-metrics";

export const App = () => {
  // const [decodedBackend, setDecodedBackend] = useState({ roles: [] });

  // useEffect(() => {
  //   const backendToken = localStorage.getItem("backendToken");
  //   if (backendToken) {
  //     console.log("backendToken present");
  //     const decoded = jwtDecode(backendToken);
  //     setDecodedBackend(decoded);
  //     console.log("Decoded token:", decoded);
  //   } else {
  //     console.log("backendToken not present");
  //   }
  // }, []);

  const decodedToken = useBackendToken();

  // if (!decodedToken) {
  //   return <div>Loading...</div>;
  // }

  // Which resources exist at all is a deployment property, so it is read from
  // the backend before anything is registered — registering them and removing
  // them a moment later would flash the full menu at the user, and react-admin
  // caches the resource definitions it saw first.
  const { jobPortalOnly, isLoaded: configLoaded } = useConfig();
  if (!configLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <Admin
      layout={Layout}
      dataProvider={dataProvider}
      authProvider={authProvider}
      // With no management surface there is nothing for the landing page to
      // show: it renders announcements and the reservations calendar, both of
      // which 404 here. The job list is the whole application in that mode.
      dashboard={jobPortalOnly ? MyJobs : Dashboard}
      loginPage={LoginPage}
      theme={lagrangeTheme}
      defaultTheme="light"
      darkTheme={null}
    >
      <>
        {/* The management surface. A job-portal-only backend does not mount
            any of it, so it is not registered at all — otherwise a bookmarked
            /projects still renders a page that only ever shows an error. */}
        {!jobPortalOnly && (
          <>
            {/* modify users access rights in authProvider.canAccess */}
            <Resource name="organizations" {...organizations}>
              <Route path=":id/users" element={<UserList />} />
              <Route path=":id/projects" element={<ProjectList />} />
            </Resource>

            <Resource name="users" {...users} />

            {/* <Resource name={"roles"} {...roles}></Resource> */}

            <Resource
              name={"slots"}
              options={{ label: "Allocated slots" }}
              {...slots}
            ></Resource>

            <Resource name="projects" {...projects}>
              <Route path=":id/users" element={<UserList />} />
              <Route
                path=":id/reservations"
                element={<Calendar key={location.pathname} />}
              />
            </Resource>

            <Resource name={"reservations"} {...reservations}></Resource>
            <Resource
              name={"organization_roles"}
              {...organizationRoles}
            ></Resource>

            <Resource
              name={"projects_users"}
              create={ProjectUserCreate}
            ></Resource>
          </>
        )}

        <CustomRoutes>
          {" "}
          {/* modify in CustomMenu.tsx */}
          {!jobPortalOnly && (
            <Route
              path="/slots-calendar"
              element={
                <Calendar hideReservations addSlots userInfo={decodedToken} />
              }
            />
          )}
          {!jobPortalOnly && (
            <Route
              path="/reservations-calendar"
              element={
                <Calendar
                  addReservations
                  hideReservations={false}
                  userInfo={decodedToken}
                />
              }
            />
          )}
          <Route
            path="/profile"
            element={
              <Profile />
            }
          />
          {!jobPortalOnly && (
            <Route path="/my-projects" element={<MyProjects />} />
          )}
          <Route path="/my-jobs" element={<MyJobs />} />
          {/* Billing reports read the accounting tables, which the backend
              does not mount in job-portal-only mode. */}
          {!jobPortalOnly && (
            <Route path="/reports" element={<ReportsPage />} />
          )}
          {/* Always routed; the panel reports itself unconfigured when the
              deployment set no URL, and the menu hides the item. */}
          <Route path="/machine-status" element={<MachineStatus />} />
          <Route path="/machine-metrics" element={<MachineMetrics />} />
        </CustomRoutes>

        {/* Jobs stay: /api/jobs is mounted in every mode, scoped to the
            caller by the backend. */}
        <Resource name={"jobs"} {...jobs}></Resource>
        {!jobPortalOnly && (
          <>
            <Resource name={"logs"} {...logs}></Resource>
            <Resource name={"announcements"} {...announcements}></Resource>
            <Resource name={"tags"} {...tags}></Resource>
            <Resource name={"notifications"} {...notifications}></Resource>
          </>
        )}
      </>
    </Admin>
  );
};
