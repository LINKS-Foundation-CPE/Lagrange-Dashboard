import { Title, useDataProvider, useNotify } from 'react-admin';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useBackendToken } from "../../hooks/useBackendToken";
import { useEffect, useState } from 'react';
import { getIqmToken, TOKEN_CLIENT_ID } from "../../services/iqmKeycloak";

interface Project {
  id: number;
  name: string;
  start_at: string | null;
  end_at: string | null;
}

export const Profile = () => {
  const notify = useNotify();
  const decodedToken = useBackendToken();
  const dataProvider = useDataProvider();

  const [projects, setProjects] = useState<Project[]>([]);
  const [defaultProject, setDefaultProject] = useState<number | null>(null);
  const [defaultProjectInvalid, setDefaultProjectInvalid] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [iqmToken, setIqmToken] = useState<string>("");
  const [iqmTokenLoading, setIqmTokenLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      dataProvider.getOwnProjects(),
      dataProvider.getDefaultProject(),
    ])
      .then(([projectsRes, defaultRes]) => {
        const defaultId = defaultRes.data.id;
        const now = new Date();
        const isInvalid = (p: { id: number; start_at: string | null; end_at: string | null }) =>
          (!!p.start_at && new Date(p.start_at) > now) || (!!p.end_at && new Date(p.end_at) < now);
        const filtered = projectsRes.data.filter((p: { id: number; start_at: string | null; end_at: string | null }) =>
          p.id === defaultId || !isInvalid(p)
        );
        const defaultP = projectsRes.data.find((p: { id: number }) => p.id === defaultId);
        setDefaultProjectInvalid(defaultP ? isInvalid(defaultP) : false);
        setProjects(filtered);
        setDefaultProject(defaultId);
        setSelected(defaultId);
      })
      .catch(() => notify('Failed to load projects', { type: 'error' }))
      .finally(() => setLoading(false));
  }, [dataProvider, notify]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dataProvider.setDefaultProject(selected);
      if (defaultProjectInvalid) {
        setProjects((prev) => prev.filter((p) => p.id !== defaultProject));
      }
      setDefaultProject(selected);
      setDefaultProjectInvalid(false);
      notify('Default project updated', { type: 'success' });
    } catch (e) {
      notify(`Failed to update default project: ${e}`, { type: 'error' });
    } finally {
      setSaving(false);
    }
  };


  const handleGetIqmToken = async () => {
    setIqmTokenLoading(true);
    try {
      const token = await getIqmToken();
      setIqmToken(token);
    } catch (e) {
      notify(`Failed to get IQM token: ${e instanceof Error ? e.message : e}`, {
        type: 'error',
      });
    } finally {
      setIqmTokenLoading(false);
    }
  };

  const handleCopyIqmToken = async () => {
    try {
      await navigator.clipboard.writeText(iqmToken);
      notify('Token copied to clipboard', { type: 'info' });
    } catch {
      notify('Failed to copy token', { type: 'error' });
    }
  };

  if (!decodedToken || loading) {
    return <div>Loading...</div>;
  }


  return (<>
    <Title title="My Profile" />
    <Card>
      <CardHeader title="Your profile" />
      <CardContent>
        {decodedToken.organization
          ? `Your organization: ${decodedToken.organization.name}`
          : "You have no organization defined"}
        <br />
        {decodedToken.roles.length
          ? `Your roles: ${decodedToken.roles}`
          : ""}
        <div>
          <br />
        </div>
        <FormControl fullWidth error={defaultProjectInvalid && selected === defaultProject}>
            <InputLabel id="project-select-label">
              Default project
            </InputLabel>
            <Select
              labelId="project-select-label"
              value={selected}
              label="Default project"
              onChange={(e) => setSelected(Number(e.target.value))}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
            {defaultProjectInvalid && selected === defaultProject && (
              <FormHelperText>This project is no longer active. Please select a new default project.</FormHelperText>
            )}
          </FormControl>

          <Stack direction="row" spacing={2} mt={2}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                saving || selected === defaultProject
              }
            >
              {saving ? 'Saving…' : 'Save default project'}
            </Button>
          </Stack>
      </CardContent>
    </Card>

    <Card sx={{ mt: 2 }}>
      <CardHeader title="Machine / IQM API token" />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This token authenticates the IQM client SDK (e.g. qiskit-iqm) with the
          quantum machine through the QC Gateway. It is the access token of your
          current login session, issued by the{' '}
          <code>{TOKEN_CLIENT_ID}</code> Keycloak client, and expires with it —
          get a fresh one when the SDK reports it as invalid.
        </Typography>

        <Stack direction="row" spacing={2} mt={2} mb={2}>
          <Button
            variant="contained"
            onClick={handleGetIqmToken}
            disabled={iqmTokenLoading}
            startIcon={
              iqmTokenLoading ? <CircularProgress size={16} color="inherit" /> : undefined
            }
          >
            {iqmTokenLoading ? 'Getting token…' : 'Get token'}
          </Button>
          {iqmToken && (
            <Button variant="outlined" onClick={handleCopyIqmToken}>
              Copy
            </Button>
          )}
        </Stack>

        {iqmToken && (
          <TextField
            value={iqmToken}
            label="IQM access token"
            multiline
            minRows={3}
            fullWidth
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' },
            }}
          />
        )}
      </CardContent>
    </Card>
  </>)
};

export default Profile;