import { useEffect, useState } from "react";
import {
  CreateButton,
  DateField,
  RecordContextProvider,
  ReferenceField,
  Title,
  useDataProvider,
  useNotify,
} from "react-admin";
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { DurationField } from "../components/DurationField";
import { useBackendToken } from "../../hooks/useBackendToken";

interface OwnProject {
  id: number;
  name: string;
  organization_id: number;
  remaining_budget: number;
  start_at: string | null;
  end_at: string | null;
  free_queue?: boolean;
}

export const MyProjects = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const decodedToken = useBackendToken();

  const [projects, setProjects] = useState<OwnProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .getOwnProjects()
      .then((res: { data: OwnProject[] }) => setProjects(res.data))
      .catch(() => notify("Failed to load your projects", { type: "error" }))
      .finally(() => setLoading(false));
  }, [dataProvider, notify]);

  // PI status: prefer the explicit list of administered project ids from the
  // token; fall back to the project-admin role when that list is absent.
  const administeredProjects: number[] = Array.isArray(
    decodedToken?.administeredProjects,
  )
    ? decodedToken.administeredProjects
    : [];
  const isProjectAdmin: boolean =
    decodedToken?.roles?.includes("project-admin") ?? false;

  const canAddUsers = (projectId: number): boolean =>
    administeredProjects.length > 0
      ? administeredProjects.includes(projectId)
      : isProjectAdmin;

  if (!decodedToken || loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Title title="My Projects" />
      <Card>
        <CardHeader title="My Projects" />
        <CardContent>
          {projects.length === 0 ? (
            <div>You are not a member of any project.</div>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Remaining budget</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <RecordContextProvider key={project.id} value={project}>
                    <TableRow>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        <ReferenceField
                          source="organization_id"
                          reference="organizations"
                          link={false}
                        />
                      </TableCell>
                      <TableCell>
                        <DurationField source="remaining_budget" />
                      </TableCell>
                      <TableCell>
                        <DateField source="start_at" />
                      </TableCell>
                      <TableCell>
                        <DateField source="end_at" />
                      </TableCell>
                      <TableCell align="right">
                        {canAddUsers(project.id) && (
                          <CreateButton
                            resource="projects_users"
                            label="Add users"
                            icon={<GroupAddIcon />}
                            state={{ record: { project_id: project.id } }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  </RecordContextProvider>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default MyProjects;
