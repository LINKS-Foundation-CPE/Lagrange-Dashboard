import { DataTable, DateField, List, ReferenceField } from 'react-admin';

const OrganizationList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="name" />
            <DataTable.Col source="reference_organization_id">
                <ReferenceField source="reference_organization_id" reference="organizations" />
            </DataTable.Col>
        </DataTable>
    </List>
);

export default OrganizationList