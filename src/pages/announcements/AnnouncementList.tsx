import { DataTable, DateField, List, RichTextField, TextField, } from 'react-admin';
import { OldRecordsFilter } from '../components/OldRecordsFilter';

export const AnnouncementList = () => {
   
    return (
        <List 
            filters={<OldRecordsFilter />}
            filterDefaultValues={{ showOld: false }}
        >
            <DataTable>
                {/* <DataTable.Col source="id" /> */}
                <DataTable.Col source="title">
                    <TextField source="title" />
                </DataTable.Col>
                <DataTable.Col source="description">
                    <RichTextField source="description" />
                </DataTable.Col>
                <DataTable.Col source="start">
                    <DateField showTime source="start" />
                </DataTable.Col>
                <DataTable.Col source="end">
                    <DateField showTime source="end" />
                </DataTable.Col>
            </DataTable>
        </List>
    );};