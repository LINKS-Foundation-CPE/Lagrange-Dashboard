import { CreateButton, useRecordContext } from 'react-admin';

export const CreateOrganizationUserButton = () => {
    const organization = useRecordContext();
    return (
        <CreateButton
            resource="users"
            state={{ record: { organization_id: organization.id } }}
        />
    );
};