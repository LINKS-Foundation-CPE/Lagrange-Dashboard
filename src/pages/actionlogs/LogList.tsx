import { DataTable, DateField, List, ReferenceField } from 'react-admin';

export const LogList = () => (
    <List>
        <DataTable>
            <DataTable.Col source="timestamp">
                <DateField showTime source="timestamp" />
            </DataTable.Col>
            <DataTable.Col source="user_id">
                <ReferenceField source="user_id" reference="users" />
            </DataTable.Col>
            <DataTable.Col source="action" />
            <DataTable.Col source="resource" />
            <DataTable.Col source="description" />
        </DataTable>
    </List>
);