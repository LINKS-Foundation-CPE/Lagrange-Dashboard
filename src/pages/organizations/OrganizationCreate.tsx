import { BooleanInput, Create, NumberInput, ReferenceInput, required, SimpleForm, TextInput } from 'react-admin';

export const OrganizationCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="name" validate={required()} />
            <ReferenceInput source="reference_organization_id" reference="organizations" />
            <NumberInput source="initial_budget" label="Initial budget (hours)"/>
            <BooleanInput source="free_queue" defaultValue={true} label='Free queue for vault project' />
        </SimpleForm>
    </Create>
);