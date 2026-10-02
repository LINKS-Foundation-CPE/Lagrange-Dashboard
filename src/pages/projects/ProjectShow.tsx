import {
  BooleanField,
  Button,
  CloneButton,
  DataTable,
  DateField,
  EditButton,
  Labeled,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  useNotify,
  useRecordContext,
  useUpdate,
  WithRecord,
} from "react-admin";
import { ArtifactButton } from '../jobs/ArtifactButton';
import { JobDurationField } from '../jobs/JobDurationField';
import { CreateProjectUserButton } from "./CreateProjectUserButton";
import { DurationField } from "../components/DurationField";
import { useBackendToken } from "../../hooks/useBackendToken";
import { ProjectTagsEditor } from "../tags/ProjectTagsEditor";
import { TagChipsField } from "../tags/TagChipsField";

export const EditProjectUserButton = () => {
  const record = useRecordContext();
  const notify = useNotify();
  const [update, { isLoading }] = useUpdate();

  if (!record) return null;

  const handleClick = (e) => {
    e.stopPropagation();

    update(
      "projects_users",
      {
        id: record.id,
        data: { ...record, admin: !record.admin },
        previousData: record,
      },
      {
        onSuccess: () => notify("Updated successfully", { type: "info" }),
        onError: (error) =>
          notify(`Update failed: ${error.message}`, { type: "error" }),
      },
    );
  };

  return (
    <Button
      size="small"
      onClick={handleClick}
      disabled={isLoading}
      variant="outlined"
    >
      {record.admin ? "Revoke Admin" : "Make Admin"}
    </Button>
  );
};

const CreateRelatedReservation = () => {
  const record = useRecordContext();
  return (
    <CloneButton
      resource="reservations"
      label="Add reservation"
      record={{ project_id: record.id }}
    />
  );
};

const ProjectUsers = () => {
  const record = useRecordContext();
  const decodedToken = useBackendToken();

  if (!decodedToken) return <div>Loading...</div>;
  if (!record) return null;

  return (
    <ReferenceManyField
      reference="projects_users"
      filter={{ id: record.id }}
      target={"projects_users"}
      pagination={<Pagination />}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="organization_id">
          <ReferenceField source="organization_id" reference="organizations" />
        </DataTable.Col>
        <DataTable.Col source="email" label="Username" />
        <DataTable.Col source="admin">
          <BooleanField source="admin" looseValue FalseIcon={null} />
        </DataTable.Col>
        {(decodedToken.roles.includes("admin") ||
          decodedToken.roles.includes("organization-manager")) && (
          <DataTable.Col>
            <EditProjectUserButton />
          </DataTable.Col>
        )}
      </DataTable>
    </ReferenceManyField>
  );
};

/**
 * Who a budget transaction is attributable to.
 *
 * Blank rather than a dash for the many transactions that have no user behind
 * them — a vault being funded, a project created with a budget — because those
 * are not missing data, they simply have no answer. Older job charges can also
 * be blank: the column was backfilled from the description, and a row the
 * pattern did not match was left alone rather than guessed at.
 */
const TransactionUserField = () => {
  const record = useRecordContext();
  const email = (record?.user as { email?: string } | undefined)?.email;
  return email ? <span>{email}</span> : null;
};

const ProjectTransactions = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <ReferenceManyField
      reference="project_transactions"
      filter={{ id: record.id }}
      target={"project_transactions"}
      pagination={<Pagination />}
      sort={{ field: "date", order: "DESC" }}
    >
      <DataTable>
        <DataTable.Col source="id" />
        <DataTable.Col source="date">
          <DateField source="date" />
        </DataTable.Col>
        <DataTable.Col source="value">
          <DurationField source="value" />
        </DataTable.Col>
        {/* The submitter for a job charge, the acting user for a reservation.
            Rendered from the row's own embedded `user` rather than as a
            reference: the endpoint sends it, so there is nothing to fetch, and
            plenty of transactions have no user at all. */}
        <DataTable.Col label="User" disableSort>
          <TransactionUserField />
        </DataTable.Col>
        <DataTable.Col source="description" />
      </DataTable>
    </ReferenceManyField>
  );
};

const ProjectJobs = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <ReferenceManyField
      reference="project_jobs"
      filter={{ id: record.id }}
      target={"project_jobs"}
      pagination={<Pagination />}
    >
      <DataTable bulkActionButtons={false}>
        <DataTable.Col source="id" />
        <DataTable.Col source="user_id">
          <ReferenceField source="user_id" reference="users" />
        </DataTable.Col>
        <DataTable.Col source="jobid" />
        <DataTable.Col source="job_type" />
        <DataTable.Col source="status" />
        <DataTable.Col label="QPU time" disableSort>
            <JobDurationField />
        </DataTable.Col>
        <DataTable.Col source="execution_start">
          <DateField showTime source="execution_start" />
        </DataTable.Col>
        <DataTable.Col source="execution_end">
          <DateField showTime source="execution_end" />
        </DataTable.Col>
        <DataTable.Col source="submitted_datetime">
          <DateField showTime source="submitted_datetime" />
        </DataTable.Col>
        <DataTable.Col source="submitted_circuit">
          <ArtifactButton source="submitted_circuit" label="Circuit" />
        </DataTable.Col>
        <DataTable.Col source="results">
          <ArtifactButton source="results" label="Results" />
        </DataTable.Col>
      </DataTable>
    </ReferenceManyField>
  );
};

export const ProjectShow = () => (
  <Show>
    <TabbedShowLayout>
      <Tab label="Project details">
        <TextField source="id" />
        <ReferenceField source="organization_id" reference="organizations" />
        <TextField source="name" />
        <BooleanField source="free_queue" />
        <DateField source="start_at" />
        <DateField source="end_at" />
        <DurationField source="remaining_budget" />
        {/* Straight off the record — projects carry their tags in the payload. */}
        <TagChipsField source="tags" />
        <WithRecord render={(record) => record.free_queue ? (
          <Labeled source="total_freequeue_time"><DurationField source="total_freequeue_time" /></Labeled>
        ) : null} />
      </Tab>
      <Tab label="Project Users">
        <ProjectUsers />
        <CreateProjectUserButton />
      </Tab>
      <Tab label="Project Reservations">
        <ReferenceManyField
          reference="reservations"
          target="project_id"
          sort={{ field: "day", order: "DESC" }}
          pagination={<Pagination />}
        >
          <DataTable>
            <DataTable.Col source="day">
              <DateField source="day" />
            </DataTable.Col>
            <DataTable.Col source="start">
              <DateField showTime showDate={false} source="start" />
            </DataTable.Col>
            <DataTable.Col source="end">
              <DateField showTime showDate={false} source="end" />
            </DataTable.Col>
            <DataTable.Col source="made_by">
              <ReferenceField source="made_by" reference={"users"} />
            </DataTable.Col>
            <DataTable.Col>
              <EditButton />
            </DataTable.Col>
          </DataTable>
        </ReferenceManyField>
        <CreateRelatedReservation />
      </Tab>
      <Tab label="Budget Transactions">
        <ProjectTransactions />
      </Tab>
      <Tab label="Jobs">
        <ProjectJobs />
      </Tab>
      {/* Its own tab, not a field on the project form: assignment is a
          separate endpoint open to this project's admins, while the project
          form is not submittable by them at all. */}
      <Tab label="Tags">
        <ProjectTagsEditor />
      </Tab>
    </TabbedShowLayout>
  </Show>
);
