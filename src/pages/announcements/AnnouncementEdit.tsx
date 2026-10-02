import { RichTextInput } from 'ra-input-rich-text';
import { DateInput, DateTimeInput, Edit, NumberInput, ReferenceInput, SimpleForm, TextInput, TimeInput } from 'react-admin';

export const AnnouncementEdit = () => {
    return(
    <Edit>
        <SimpleForm>
            <TextInput source="title" />
            <RichTextInput source="description" />
            <DateTimeInput source="start" parse={(date: string) => (date ? new Date(date).toISOString() : null)} />
            <DateTimeInput source="end" parse={(date: string) => (date ? new Date(date).toISOString() : null)} />
        </SimpleForm>
    </Edit>
)
};