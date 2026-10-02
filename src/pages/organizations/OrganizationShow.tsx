import {
    BooleanField,
    DataTable,
    DateField,
    EditButton,
    Pagination,
    ReferenceField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    Tab,
    TabbedShowLayout,
    useRecordContext,
} from 'react-admin';
import { ArtifactButton } from '../jobs/ArtifactButton';
import { JobDurationField } from '../jobs/JobDurationField';
import { CreateOrganizationRoleButton } from './CreateOrganizationRoleButton';
import { CreateOrganizationUserButton } from './CreateOrganizationUserButton';
import { CreateOrganizationProjectButton } from './CreateOrganizationProjectButton';
import BudgetTransferTab from './BudgetTransferTab';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FindInPageIcon from '@mui/icons-material/FindInPage';

const OrganizationRoles = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <>
            <ReferenceManyField
                reference="organization_roles"
                filter={{ id: record.id }} target={'organization_roles'} >
                <DataTable>
                    {/* <DateField showTime source="start_at" />
                    <DateField showTime source="end_at" /> */}
                    {/* <ReferenceField source="org_id" reference={'organizations'} /> */}
                    {/* <TextField source="id" /> */}
                    <DataTable.Col source="user_id">
                        <ReferenceField source="user_id" reference="users" />
                    </DataTable.Col>
                    <DataTable.Col source="role_id">
                        <ReferenceField source="role_id" reference="roles" />
                    </DataTable.Col>
                    {/* <EditButton /> */}
                </DataTable>
            </ReferenceManyField>
            <CreateOrganizationRoleButton />
        </>
    );
};

// const ProjectBudgets = () => {
//     const record = useRecordContext();
//     if (!record) return null;
//     return (
//         <>
//             <ReferenceManyField
//                             reference="projects"
//                             target="organization_id"
//                         >
//                             <DataTable>
//                                 <DataTable.Col source="name" />
//                                 <DataTable.Col source="remaining_budget" />
//                                 <DataTable.Col>
//                                     <EditButton />
//                                 </DataTable.Col>
//                             </DataTable>
//                         </ReferenceManyField>
//         </>
//     );
// };

const OrganizationJobs = () => {
  const record = useRecordContext();
  if (!record) return null;
  return (
    <ReferenceManyField
      reference="organization_jobs"
      filter={{ id: record.id }}
      target={"organization_jobs"}
      pagination={<Pagination />}
    >
      <DataTable bulkActionButtons={false}>
                  <DataTable.Col source="id" />
                  <DataTable.Col source="project_id">
                      <ReferenceField source="project_id" reference="projects" />
                  </DataTable.Col>
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

export const OrganizationShow = () => (
    <Show>
        <TabbedShowLayout>

           {/*  <TextField source="id" />
            <TextField source="name" />
            <ReferenceField source="reference_org_id" reference="organizations" /> */}
            <Tab label="Projects">
                        <ReferenceManyField
                            reference="projects"
                            target="organization_id"
                            pagination={<Pagination />}
                            /* sort={{ field: 'start_at', order: 'DESC' }} */
                        >
                            <DataTable>
                                {/* <DateField showTime source="start_at" />
                                <DateField showTime source="end_at" /> */}
                                {/* <ReferenceField source="org_id" reference={'organizations'} /> */}
                                <DataTable.Col source="name" />
                                <DataTable.Col>
                                    <EditButton />
                                </DataTable.Col>
                            </DataTable>
                        </ReferenceManyField>
                        <CreateOrganizationProjectButton />
                        {/* <CreateRelatedReservation /> */}
                    </Tab>
                    <Tab label="Users">
                        <ReferenceManyField
                            reference="users"
                            target="organization_id"
                            pagination={<Pagination />}
                            /* sort={{ field: 'start_at', order: 'DESC' }} */
                        >
                            <DataTable>
                                {/* <DateField showTime source="start_at" />
                                <DateField showTime source="end_at" /> */}
                                {/* <ReferenceField source="org_id" reference={'organizations'} /> */}
                                <DataTable.Col source="email" label="Username" />
                                <DataTable.Col source="organization_manager">
                                    <BooleanField source="organization_manager" looseValue FalseIcon={null} TrueIcon={AdminPanelSettingsIcon} />
                                </DataTable.Col>
                                <DataTable.Col source="organization_auditor">
                                    <BooleanField source="organization_auditor" looseValue FalseIcon={null} TrueIcon={FindInPageIcon} />
                                </DataTable.Col>
                                <DataTable.Col>
                                    <EditButton />
                                </DataTable.Col>
                            </DataTable>
                        </ReferenceManyField>
                        <CreateOrganizationUserButton />
                        {/* <CreateRelatedReservation /> */}
                    </Tab>
                    {/* <Tab label="Roles">
                        <OrganizationRoles />
                    </Tab> */}

                    <Tab label="Transfer Budget">
                        <BudgetTransferTab />
                    </Tab>
                    <Tab label="Jobs">
                        <OrganizationJobs />
                    </Tab>
        </TabbedShowLayout>
    </Show>
);