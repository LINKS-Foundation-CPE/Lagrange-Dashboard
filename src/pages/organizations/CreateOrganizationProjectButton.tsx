import { CreateButton, useRecordContext } from 'react-admin';

export const CreateOrganizationProjectButton = () => {
    const organization = useRecordContext();
    return (
        <CreateButton
            resource="projects"
            state={{ record: { organization_id: organization.id } }}
        />
    );
};