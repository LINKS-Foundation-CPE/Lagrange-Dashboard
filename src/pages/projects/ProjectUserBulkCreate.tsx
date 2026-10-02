import {
  Create,
  SimpleForm,
  ReferenceInput,
  TextInput,
  required,
  Toolbar,
  SaveButton,
} from "react-admin";
import { Button, Box, Typography, CircularProgress } from "@mui/material";
import { useBackendToken } from "../../hooks/useBackendToken";
import { useBatchUserCreation } from "../../hooks/useBatchUserCreation";

export const ProjectUserCreate = () => {
  const decodedToken = useBackendToken();
  const {
    progress,
    isRunning,
    handleSubmit,
    handleRetryFailed,
    total,
    successCount,
    errorCount,
    pendingCount,
  } = useBatchUserCreation("projects_users");

  if (!decodedToken) return <div>Loading...</div>;

  return (
    <Create redirect="list">
      <SimpleForm
        onSubmit={handleSubmit}
        toolbar={
          <Toolbar>
            <SaveButton label="Add" />
          </Toolbar>
        }
      >
        {decodedToken.roles.includes("admin") && (
          <ReferenceInput source="project_id" reference="projects" />
        )}
        <TextInput
          label="Usernames (comma separated)"
          source="emails"
          fullWidth
          validate={required()}
        />

        {total > 0 && (
          <Box mt={2}>
            {/* Numerical progress */}
            <Typography variant="subtitle1" gutterBottom>
              Progress: {successCount} / {total} users created
              {pendingCount > 0 && ` — ${pendingCount} pending`}
              {errorCount > 0 && ` — ${errorCount} failed`}
            </Typography>

            {/* Per-email feedback */}
            {Object.entries(progress).map(([email, { status, error }]) => (
              <Box key={email} display="flex" alignItems="center" mb={0.5}>
                <Typography sx={{ flexGrow: 1 }}>
                  {email} —{" "}
                  {status === "pending" && (
                    <>
                      ⏳ Creating... <CircularProgress size={14} sx={{ ml: 1 }} />
                    </>
                  )}
                  {status === "success" && "✅ Created"}
                  {status === "error" && (
                    <span style={{ color: "red" }}>❌ Failed ({error})</span>
                  )}
                </Typography>
              </Box>
            ))}

            {/* Retry button */}
            <Box mt={2}>
              <Button
                variant="outlined"
                color="secondary"
                disabled={isRunning || errorCount === 0}
                onClick={handleRetryFailed}
              >
                Retry failed
              </Button>
            </Box>
          </Box>
        )}
      </SimpleForm>
    </Create>
  );
};
