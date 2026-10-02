import { ReactNode } from 'react';
import {
    CloneButton,
    DataTable,
    DateField,
    EditButton,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    Show,
    SimpleShowLayout,
    Tab,
    TabbedShowLayout,
    TextField,
    useDataProvider,
    useRecordContext,
    WithRecord,
} from 'react-admin';

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
    if (!record) return null;
    return (
        <ReferenceManyField
            reference="projects_users"
            filter={{ id: record.id }} target={'projects_users'} >
            <DataTable>
                {/* <DateField showTime source="start_at" />
                <DateField showTime source="end_at" /> */}
                {/* <ReferenceField source="org_id" reference={'organizations'} /> */}
                <DataTable.Col source="id" />
                <DataTable.Col source="org_id">
                    <ReferenceField source="org_id" reference="organizations" />
                </DataTable.Col>
                <DataTable.Col source="email" label="Username" />
                <DataTable.Col source="default_prj_id">
                    <ReferenceField source="default_prj_id" reference="projects" />
                </DataTable.Col>
                <DataTable.Col>
                    <EditButton />
                </DataTable.Col>
            </DataTable>
        </ReferenceManyField>
    );
};


export const JobShow = () => {
    const dataProvider = useDataProvider();
  return (
      <Show>
          <TabbedShowLayout>
          <Tab label="Project details">
              <TextField source="id" />
              <ReferenceField source="org_id" reference="organizations" />
              <TextField source="name" />
              <DateField source="start_at" />
              <DateField source="end_at" />
              <NumberField source="total_budget" />
              <NumberField source="spent_budget" />
              </Tab>
              <Tab label="Project Users">
                  <ProjectUsers />
                  {/* <WithRecord render={(record) => { console.log("Record: ", record); return(<ReferenceManyField
                          reference="project_users"
                          filter={{ id: record.id }} >
                              <Datagrid>
                                  {/* <DateField showTime source="start_at" />
                                  <DateField showTime source="end_at" /> */}
                                  {/* <ReferenceField source="org_id" reference={'organizations'} /> /}
                                  <TextField source="username" />
                                  <EditButton />
                              </Datagrid>
                          </ReferenceManyField>)}}>                        
                          </WithRecord> */}
                      </Tab>
                      <Tab label="Project Reservations">
                          <ReferenceManyField
                              reference="reservations"
                              target="prj_id"
                              sort={{ field: 'day', order: 'DESC' }}
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
                                      <ReferenceField source="made_by" reference={'users'} />
                                  </DataTable.Col>
                                  {/* <TextField source="body" /> */}
                                  <DataTable.Col>
                                      <EditButton />
                                  </DataTable.Col>
                              </DataTable>
                          </ReferenceManyField>
                          <CreateRelatedReservation />
                      </Tab>
          </TabbedShowLayout>
      </Show>
  );
};