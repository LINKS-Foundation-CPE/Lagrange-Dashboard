import { DateField, NumberField, ReferenceField, RichTextField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const AnnouncementShow = () => (
    <Show>
        <SimpleShowLayout>
            <RichTextField source="description" />
            <DateField showTime source="start" />
            <DateField showTime source="end" />
        </SimpleShowLayout>
    </Show>
);