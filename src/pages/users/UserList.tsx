import { DataTable, List, ReferenceField, SearchInput } from 'react-admin';
import { OrganizationFilter } from '../components/OrganizationFilter';

// Always-visible search box; the backend does a case-insensitive substring
// match on the identity (users.email) for the `q` param — an e-mail address or
// a cluster account name (see quantum-api user.service.getList).
const userFilters = [
    <SearchInput key="q" source="q" alwaysOn placeholder="Search username" />,
    OrganizationFilter,
];

export const UserList = () => (
    <List filters={userFilters}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="organization_id">
                <ReferenceField source="organization_id" reference="organizations" />
            </DataTable.Col>
            <DataTable.Col source="email" label="Username" />
            <DataTable.Col source="default_project_id">
                <ReferenceField source="default_project_id" reference="projects" />
            </DataTable.Col>
        </DataTable>
    </List>
);