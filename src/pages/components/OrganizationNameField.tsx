import { useGetOne, RaRecord } from "react-admin";

export const OrganizationNameField = ({ record }: { record: RaRecord }) => {
  // Use the passed record (project) instead of context
  const project = record;
  const { data: organization, isLoading, error } = useGetOne('organizations', { id: project.organization_id });

  if (isLoading) return <span>Loading org...</span>;
  if (error) return <span>Error loading org</span>;

  return <span>{organization?.name}</span>;
};