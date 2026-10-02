import { useRecordContext } from "react-admin";
import { Button, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface ArtifactButtonProps {
  source: string;
  label?: string;
}

/**
 * Link to a job artifact (the submitted circuit, the results) as a button.
 *
 * A bare URL in a dense table is a long, wrapping, hard-to-hit target; a button
 * is one consistent shape per row. Jobs that have not produced the artifact yet
 * get a muted dash rather than an empty cell, so "not there" reads differently
 * from "column is broken".
 *
 * `stopPropagation` keeps a click on the button from also triggering the row.
 */
export const ArtifactButton = ({
  source,
  label = "Open",
}: ArtifactButtonProps) => {
  const record = useRecordContext();
  const url = record?.[source];

  if (!url) {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  return (
    <Button
      size="small"
      variant="outlined"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      startIcon={<OpenInNewIcon />}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </Button>
  );
};
