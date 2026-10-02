import { DataTable, DateField, List, ReferenceField, TopToolbar } from 'react-admin';
import { ArtifactButton } from './ArtifactButton';
import { JobDurationField } from './JobDurationField';
import { JobsExportButton } from './JobsExportButton';

// Shared columns for both the admin "All Jobs" list and the per-user "My Jobs"
// list, so the two stay in sync.
//
// `showUser` is off on "My Jobs": every row there is the caller's own, so the
// column costs width and says nothing.
export const JobsDataTable = ({ showUser = true }: { showUser?: boolean }) => (
    <DataTable bulkActionButtons={false}>
        <DataTable.Col source="id" />
        <DataTable.Col source="project_id">
            <ReferenceField source="project_id" reference="projects" />
        </DataTable.Col>
        {showUser && (
            <DataTable.Col source="user_id">
                <ReferenceField source="user_id" reference="users" />
            </DataTable.Col>
        )}
        <DataTable.Col source="jobid" />
        <DataTable.Col source="job_type" />
        <DataTable.Col source="status" />
        {/* Derived from the two timestamps that follow it, and placed before
            them: what a reader wants from this row is how much it consumed,
            not when it happened. Not sortable — no backend column to sort. */}
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
);

// Shared toolbar, so both job lists export the same way. The only reason to
// replace the default one is the export button: react-admin's stops at 1000
// rows without saying so.
export const JobsListActions = () => (
    <TopToolbar>
        <JobsExportButton />
    </TopToolbar>
);

// Admin "All Jobs": unfiltered list of every job.
export const JobList = () => (
    <List actions={<JobsListActions />}>
        <JobsDataTable />
    </List>
);
