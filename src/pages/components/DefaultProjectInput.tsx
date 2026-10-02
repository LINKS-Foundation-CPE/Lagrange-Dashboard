import { AutocompleteInput, ReferenceInput } from "react-admin";

/**
 * The default-project picker, shared by the user form and the bulk create form
 * so the two cannot drift.
 *
 * A bare `<ReferenceInput>` renders a plain select over whatever one page of
 * projects the API happened to return — in practice the first 25 by id, with no
 * way to search and no way to reach anything outside them. On a deployment with
 * more projects than that, most of them simply cannot be selected.
 *
 * `filterToQuery` is what fixes it: the typed text goes to the backend as `q`,
 * which matches the project name as a **case-insensitive substring**. Substring
 * rather than prefix is a requirement, not a nicety — project names follow a
 * convention where the distinguishing part is rarely at the front, so anchoring
 * the match would find nothing anyone is looking for.
 */
export const DefaultProjectInput = () => (
  <ReferenceInput source="default_project_id" reference="projects">
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
