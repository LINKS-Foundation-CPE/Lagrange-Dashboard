import { CreateButton, useRecordContext } from 'react-admin';

export const CreateProjectUserButton = () => {
    const project = useRecordContext();
    return (
        <CreateButton
            resource="projects_users"
            label="Add users"
            state={{ record: { project_id: project.id } }}
        />
    );
};