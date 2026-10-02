import { BooleanField, DataTable, DateField, List, ReferenceField, SearchInput } from 'react-admin';
import { DurationField } from '../components/DurationField';
import { OrganizationFilter } from '../components/OrganizationFilter';
import { TagChipsField } from '../tags/TagChipsField';

/* `q` is a case-insensitive substring match on the name, which the backend has
   accepted since the default-project picker needed it. Substring and not
   prefix matters here: project names carry a convention where the
   distinguishing part is rarely at the front, so an anchored match would miss
   what people actually type. */
const projectFilters = [
    <SearchInput key="q" source="q" alwaysOn placeholder="Search project name" />,
    OrganizationFilter,
];

export const ProjectList = () => (
    <List filter={{administrable: true}} filters={projectFilters}>
        <DataTable>
            <DataTable.Col source="id" />
            <DataTable.Col source="organization_id">
                <ReferenceField source="organization_id" reference="organizations" />
            </DataTable.Col>
            <DataTable.Col source="name" />
            <DataTable.Col source="start_at">
                <DateField source="start_at" />
            </DataTable.Col>
            <DataTable.Col source="end_at">
                <DateField source="end_at" />
            </DataTable.Col>
            <DataTable.Col source="free_queue">
                <BooleanField source="free_queue" />
            </DataTable.Col>
            {/* <DataTable.NumberCol source="total_budget" />
            <DataTable.NumberCol source="spent_budget" /> */}
            <DataTable.Col source="remaining_budget">
                <DurationField source="remaining_budget" />
            </DataTable.Col>
            {/* Tags ride along in the projects payload, so this column is free;
                not sortable, because the backend sorts projects, not tags. */}
            <DataTable.Col source="tags" label="Tags" disableSort>
                <TagChipsField />
            </DataTable.Col>
        </DataTable>
    </List>
);