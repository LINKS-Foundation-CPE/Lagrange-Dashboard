import { DataTable, DateField, List, ReferenceField, useRecordContext, useGetOne } from 'react-admin';
import { OldRecordsFilter } from '../components/OldRecordsFilter';
import { OrganizationNameField } from '../components/OrganizationNameField';
import { ProjectWithOrganization } from '../components/ProjectWithOrganization';

export const ReservationList = () => (
    <List filters={<OldRecordsFilter />}
    filterDefaultValues={{ showOld: false }}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="project_id">
                {/* <ReferenceField source="project_id" reference="projects" /> */}
                <ProjectWithOrganization />
            </DataTable.Col>
            <DataTable.Col source="made_by">
                <ReferenceField source="made_by" reference="users" />
            </DataTable.Col>
            <DataTable.Col source="slot_id">
                <ReferenceField source="slot_id" reference="slots" />
            </DataTable.Col>
            <DataTable.Col source="day">
                <DateField source="day" />
            </DataTable.Col>
            <DataTable.Col source="start">
                <DateField showTime showDate={false} source="start" />
            </DataTable.Col>
            <DataTable.Col source="end">
                <DateField showTime showDate={false} source="end" />
            </DataTable.Col>
            <DataTable.Col source="description" />
        </DataTable>
    </List>
);