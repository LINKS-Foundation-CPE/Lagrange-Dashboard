import { DateField, EditButton, ReferenceField, Show, SimpleShowLayout, TextField, TopToolbar, useGetOne, useRecordContext } from 'react-admin';
import { SeriesDeleteButton } from '../series/SeriesDeleteButton';

const OrganizationNameField = () => {
  const record = useRecordContext(); // record here is the project record
  const { data, isLoading, error } = useGetOne('organizations', { id: record.organization_id });

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error</span>;
  return <span>{data?.name}</span>;
};

const ReservationShowActions = () => (
    <TopToolbar>
        <EditButton />
        <SeriesDeleteButton kind="reservations" redirectTo="/reservations-calendar" />
    </TopToolbar>
);

export const ReservationShow = () => (
    <Show actions={<ReservationShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="project_id" reference="projects">
                <OrganizationNameField /> {` - `}
                <TextField source="name" />
            </ReferenceField>
            <TextField source="description" />
            <ReferenceField source="made_by" reference="users" />
            <ReferenceField source="slot_id" reference="slots" />
            <DateField source="day" />
            <DateField showTime showDate={false} source="start" />
            <DateField showTime showDate={false} source="end" />
        </SimpleShowLayout>
    </Show>
);