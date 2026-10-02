import { DataTable, DateField, List, ReferenceField } from 'react-admin';
import { BooleanInput, Filter } from 'react-admin';
import { OldRecordsFilter } from '../components/OldRecordsFilter';

export const SlotList = () => {
   
    return (
        <List 
            filters={<OldRecordsFilter />}
            filterDefaultValues={{ showOld: false }}
        >
            <DataTable>
                <DataTable.Col source="id" />
                <DataTable.Col source="organization_id">
                    <ReferenceField source="organization_id" reference="organizations" />
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
            </DataTable>
        </List>
    );};