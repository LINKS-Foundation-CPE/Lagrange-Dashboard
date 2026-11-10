import {
  AutocompleteInput,
  ReferenceInput,
  SelectInput,
  useGetManyReference,
  useRecordContext,
} from "react-admin";

/**
 * Default-project picker for a **new** user (single and bulk create).
 *
 * Creating a user also makes them a member of their default project, so the
 * choice is a grant of access to that project. `administrable: true` limits
 * the options to the projects the caller may hand out: every project for a
 * platform admin, the caller's organization's projects for an organization
 * manager. Without it the picker listed every project on the platform
 * (quantum-dashboard#31), and the backend now refuses another organization's
 * project anyway.
 *
 * `filterToQuery` sends the typed text as `q`, a case-insensitive substring
 * match on the project name. Substring rather than prefix is a requirement:
 * the distinguishing part of a project name is rarely at the front.
 */
export const DefaultProjectInput = () => (
  <ReferenceInput
    source="default_project_id"
    reference="projects"
    filter={{ administrable: true }}
  >
    <AutocompleteInput
      label="Default project"
      optionText="name"
      filterToQuery={(searchText) => ({ q: searchText })}
      // The backend does the filtering, so the client must not also filter the
      // page it was given — it would hide matches that are on the server's next
      // page.
      filterSelectedOptions={false}
      noOptionsText="No project matches"
      sx={{ minWidth: 280 }}
    />
  </ReferenceInput>
);

/**
 * Default-project picker for an **existing** user: only the projects that user
 * is a member of. The backend accepts nothing else (`User is not part of that
 * project`), so offering other projects only produced a save that fails
 * (quantum-dashboard#31). A user belongs to few projects, so one page holds
 * them all and a plain select is enough.
 */
export const UserDefaultProjectInput = () => {
  const record = useRecordContext();
  const { data, isPending } = useGetManyReference(
    "user_projects",
    {
      target: "user_projects",
      id: record?.id,
      filter: { id: record?.id },
      pagination: { page: 1, perPage: 1000 },
      sort: { field: "name", order: "ASC" },
    },
    { enabled: record?.id != null },
  );
  return (
    <SelectInput
      source="default_project_id"
      label="Default project"
      choices={data ?? []}
      optionText="name"
      isPending={isPending}
      emptyText="None"
      sx={{ minWidth: 280 }}
    />
  );
};
