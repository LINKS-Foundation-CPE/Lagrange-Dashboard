import { Edit, ReferenceInput, required, SimpleForm, TextInput } from 'react-admin';

export const OrganizationEdit = () => (
    <Edit mutationMode="pessimistic">
        <SimpleForm>
            <TextInput source="name" validate={required()} />
            <ReferenceInput source="reference_organization_id" reference="organizations" />
        </SimpleForm>
    </Edit>
);