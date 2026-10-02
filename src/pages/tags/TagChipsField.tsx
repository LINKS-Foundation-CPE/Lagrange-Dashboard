import { Chip, Stack, Typography } from "@mui/material";
import { useRecordContext } from "react-admin";
import { readTags, sortTags } from "../../services/tags";

interface TagChipsFieldProps {
  /** Where the tag array sits on the record. `tags` on a project. */
  source?: string;
}

/**
 * The tags on the current record, read straight off the record.
 *
 * Projects come back from the API with their tags attached, so this is a field
 * over data that is already in hand rather than a reference field: a page of
 * 25 projects costs no extra request, which a `ReferenceArrayField` could not
 * promise.
 */
export const TagChipsField = ({ source = "tags" }: TagChipsFieldProps) => {
  const record = useRecordContext();
  const tags = sortTags(readTags(record?.[source]));

  // An untagged project should read as "none", not as a broken cell.
  if (tags.length === 0) {
    return (
      <Typography variant="body2" color="text.disabled">
        &mdash;
      </Typography>
    );
  }

  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap">
      {tags.map((tag) => (
        <Chip key={tag.id} label={tag.name} size="small" />
      ))}
    </Stack>
  );
};
