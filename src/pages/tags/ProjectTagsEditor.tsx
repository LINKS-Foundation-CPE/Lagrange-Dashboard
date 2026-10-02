import { useState } from "react";
import {
  DataProvider,
  Identifier,
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import { readTags, sameTags, sortTags, Tag } from "../../services/tags";
import { useBackendToken } from "../../hooks/useBackendToken";
import { TagChipsField } from "./TagChipsField";
import { tagErrorMessage } from "./tagErrors";

/**
 * The one custom data-provider method this control needs. Declaring it as an
 * intersection with `DataProvider` keeps the call typed without weakening the
 * provider's own signatures.
 */
interface ProjectTagsProvider {
  setProjectTags: (
    projectId: Identifier,
    tagIds: number[],
  ) => Promise<{ data: Tag[] }>;
}

/**
 * Assigning tags to a project.
 *
 * A control of its own rather than a field on the project form, and not by
 * preference: `PUT /api/projects/:id` is admin and organization-manager only,
 * while `PUT /api/projects/:id/tags` is also open to the project's own admins.
 * A PI must therefore be able to change tags on a page whose project form they
 * cannot submit at all — so the two must not share a submit. Keeping the
 * selection out of any react-admin form bound to the `projects` resource is
 * also the only way `tags` cannot end up in the project update body by
 * accident: there is no form field for it to be registered on.
 *
 * Same shape as `BudgetTransferTab`: a tab on the Show page, local state, one
 * data-provider call, then a refresh so the chips elsewhere follow.
 */
export const ProjectTagsEditor = () => {
  const project = useRecordContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const decodedToken = useBackendToken();
  const dataProvider = useDataProvider<DataProvider & ProjectTagsProvider>();

  // The whole vocabulary: it is a short admin-curated list, and the picker has
  // to offer all of it because ids outside it are refused with a 400.
  const { data: vocabulary, isLoading } = useGetList("tags", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "name", order: "ASC" },
  });

  // `null` means "not touched yet", so a background refetch of the project
  // cannot discard a selection in progress, and the control needs no effect to
  // stay in step with the record.
  const [draft, setDraft] = useState<Tag[] | null>(null);
  const [saving, setSaving] = useState(false);

  if (!project) return null;

  const assigned = sortTags(readTags(project.tags));
  const selected = draft ?? assigned;
  const dirty = draft !== null && !sameTags(draft, assigned);
  const options = sortTags(readTags(vocabulary));

  // Mirrors the backend guard on PUT /projects/:id/tags — platform admins,
  // organization managers, and the admins of this project. Mirrored for the
  // UX only; the backend is authoritative and answers 403 either way.
  const roles: string[] = Array.isArray(decodedToken?.roles)
    ? decodedToken.roles
    : [];
  const administeredProjects: number[] = Array.isArray(
    decodedToken?.administeredProjects,
  )
    ? decodedToken.administeredProjects
    : [];
  const canAssign =
    roles.includes("admin") ||
    roles.includes("organization-manager") ||
    (roles.includes("project-admin") &&
      // Same fallback as "My Projects": trust the explicit list when the token
      // carries one, and the role alone when it does not.
      (administeredProjects.length === 0 ||
        administeredProjects.includes(Number(project.id))));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ids, never names: the vocabulary exists so a typo cannot create a tag.
      await dataProvider.setProjectTags(
        project.id,
        selected.map((tag) => tag.id),
      );
      notify("Tags saved", { type: "info" });
      setDraft(null);
      // The project record carries the tags every other view renders, so it is
      // the record that has to be refetched, not this control's state.
      refresh();
    } catch (error: unknown) {
      notify(tagErrorMessage(error, "Could not save the tags"), {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!canAssign) {
    return (
      <Box display="flex" flexDirection="column" gap={1}>
        <TagChipsField />
        <Typography variant="body2" color="text.secondary">
          Only the project&apos;s administrators, the organization manager and
          platform admins can change these.
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2} maxWidth={520}>
      <Typography variant="body2" color="text.secondary">
        Tags come from a vocabulary the platform admins maintain. Saving here
        replaces the whole set on this project and changes nothing else about
        it.
      </Typography>

      <Autocomplete
        multiple
        disableCloseOnSelect
        options={options}
        loading={isLoading}
        value={selected}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_event, value) => setDraft([...value])}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip key={key} size="small" label={option.name} {...tagProps} />
            );
          })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder={selected.length ? undefined : "Pick from the list"}
          />
        )}
      />

      {!isLoading && options.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No tags have been defined yet. A platform admin creates them under
          Tags.
        </Typography>
      )}

      <Box display="flex" gap={1}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : "Save tags"}
        </Button>
        <Button onClick={() => setDraft(null)} disabled={!dirty || saving}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};
