import { DateTimeInput, Create, SimpleForm, TextInput } from 'react-admin';
import { RichTextInput } from 'ra-input-rich-text'

export const AnnouncementCreate = () => {
    return (
    <Create>
        <SimpleForm>
            <TextInput source="title" />
            <RichTextInput source="description" />
            <DateTimeInput source="start" parse={(date: string) => (date ? new Date(date).toISOString() : null)} />
            <DateTimeInput source="end" parse={(date: string) => (date ? new Date(date).toISOString() : null)} />
        </SimpleForm>
    </Create>
)};