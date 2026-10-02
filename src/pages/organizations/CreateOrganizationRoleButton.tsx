import { CreateButton, useRecordContext } from 'react-admin';

export const CreateOrganizationRoleButton = () => {
    const organization = useRecordContext();
    return (
        <CreateButton
            resource="organization_roles"
            state={{ record: { organization_id: organization.id } }}
        />
    );
};