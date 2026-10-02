import { BooleanField, DataTable, DateField, EditButton, NumberField, Pagination, ReferenceField, ReferenceManyField, Show, SimpleShowLayout, Tab, TabbedShowLayout, TextField, useRecordContext } from 'react-admin';
import { ArtifactButton } from '../jobs/ArtifactButton';
import { JobDurationField } from '../jobs/JobDurationField';
import { CreateOrganizationProjectButton } from '../organizations/CreateOrganizationProjectButton';
import { DurationField } from '../components/DurationField';


const UserProjects = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <ReferenceManyField
      reference="user_projects"
      filter={{ id: record.id }}
      target={"user_projects"}
    >
      <DataTable rowClick={false} bulkActionButtons={false}>
        <DataTable.Col source="name" />
        <DataTable.Col source="remaining_budget">
          <DurationField source="remaining_budget" />
        </DataTable.Col>
      </DataTable>
    </ReferenceManyField>
  );
};

const UserJobs = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <ReferenceManyField
      reference="user_jobs"
      filter={{ id: record.id }}
      target={"user_jobs"}
    >
      <DataTable rowClick={false} bulkActionButtons={false}>
                    <DataTable.Col source="id" />
                    <DataTable.Col source="project_id">
                        <ReferenceField source="project_id" reference="projects" />
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


export const UserShow = () => (
    <Show>
        <TabbedShowLayout>
            <Tab label="User details">
                <TextField source="id" />
                <ReferenceField source="organization_id" reference="organizations" />
                <TextField source="email" label="Username" />
                <ReferenceField source="default_project_id" reference="projects" />
                <BooleanField source="pulla_user" label="Pulse access" />
            </Tab>
            <Tab label="Projects">
                <UserProjects />
            </Tab>
            <Tab label="Jobs">
              <UserJobs />
            </Tab>
        </TabbedShowLayout>
    </Show>
);