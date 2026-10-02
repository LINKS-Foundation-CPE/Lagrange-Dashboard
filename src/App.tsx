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

  return (
    <Admin
      layout={Layout}
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      loginPage={LoginPage}
      theme={lagrangeTheme}
      defaultTheme="light"
      darkTheme={null}
    >
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
        <Resource name={"organization_roles"} {...organizationRoles}></Resource>

        <Resource name={"projects_users"} create={ProjectUserCreate}></Resource>

        <CustomRoutes>
          {" "}
          {/* modify in CustomMenu.tsx */}
          <Route
            path="/slots-calendar"
            element={
              <Calendar hideReservations addSlots userInfo={decodedToken} />
            }
          />
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
          <Route
            path="/profile"
            element={
              <Profile />
            }
          />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/reports" element={<ReportsPage />} />
          {/* Always routed; the panel reports itself unconfigured when the
              deployment set no URL, and the menu hides the item. */}
          <Route path="/machine-status" element={<MachineStatus />} />
          <Route path="/machine-metrics" element={<MachineMetrics />} />
        </CustomRoutes>

        <Resource name={"jobs"} {...jobs}></Resource>
        <Resource name={"logs"} {...logs}></Resource>
        <Resource name={"announcements"} {...announcements}></Resource>
        <Resource name={"tags"} {...tags}></Resource>
        <Resource name={"notifications"} {...notifications}></Resource>
      </>
    </Admin>
  );
};
