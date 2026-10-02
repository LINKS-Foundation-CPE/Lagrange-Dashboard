import { useGetOne, useRecordContext } from "react-admin";
import { OrganizationNameField } from "./OrganizationNameField";

export const ProjectWithOrganization = () => {
  const record = useRecordContext(); // main record with project_id
  const { data: project, isLoading, error } = useGetOne('projects', { id: record.project_id });

  if (isLoading) return <span>Loading project...</span>;
  if (error) return <span>Error loading project</span>;

  return (
    <div>
        <strong>Organization:</strong>{' '}
        {project.organization_id ? (
        <OrganizationNameField record={project} />
      ) : (
        <em>No organization</em>
      )}<br />
      <strong>Project:</strong> {project.name} 
      
      
    </div>
  );
};