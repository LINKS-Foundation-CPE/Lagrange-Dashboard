import { List } from "react-admin";
import { JobsDataTable, JobsListActions } from "../jobs/JobList";
import { useBackendToken } from "../../hooks/useBackendToken";

// "My Jobs": the current user's own jobs. The backend applies the `user_id`
// filter as an exact `where`, so `{ user_id: <token id> }` scopes the `jobs`
// resource to jobs owned by the logged-in user (admins included).
export const MyJobs = () => {
  const decodedToken = useBackendToken();

  if (!decodedToken) {
    return <div>Loading...</div>;
  }

  return (
    // One title only. `<List title>` already renders into the app bar's
    // TitlePortal, so a `<Title>` beside it printed the name twice.
    <List
      resource="jobs"
      filter={{ user_id: decodedToken.id }}
      title="My Jobs"
      actions={<JobsListActions />}
    >
      <JobsDataTable showUser={false} />
    </List>
  );
};

export default MyJobs;
