import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  Edit,
  EditButton,
  List,
  NumberField,
  NumberInput,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { TagChipsField } from "../pages/tags/TagChipsField";

/**
 * Representative views for the theme preview.
 *
 * Deliberately generic: the point is to show every surface a theme touches —
 * table, form, show layout, buttons, chips, alerts — not to reproduce the real
 * pages, whose shapes depend on the API.
 */

export const PreviewList = () => (
  <List perPage={10}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="organization_name" label="Organization" />
      <BooleanField source="free_queue" label="Free queue" />
      <NumberField source="remaining_budget" label="Remaining budget" />
      <TagChipsField source="tags" />
      <EditButton />
    </Datagrid>
  </List>
);

export const JobsList = () => (
  <List resource="jobs" perPage={10}>
    <Datagrid rowClick={false}>
      <TextField source="jobid" label="Job ID" />
      <TextField source="status" />
      <TextField source="project_name" label="Project" />
      <TextField source="organization_name" label="Organization" />
      <NumberField source="duration" label="Duration (s)" />
      <DateField source="submitted_datetime" label="Submitted" showTime />
    </Datagrid>
  </List>
);

export const PreviewEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <NumberInput source="remaining_budget" />
      <BooleanInput source="free_queue" />
    </SimpleForm>
  </Edit>
);

export const PreviewCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" fullWidth />
      <TextInput source="description" multiline rows={3} fullWidth />
      <NumberInput source="remaining_budget" />
      <BooleanInput source="free_queue" />
    </SimpleForm>
  </Create>
);

export const PreviewShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="organization_name" label="Organization" />
      <BooleanField source="free_queue" label="Free queue" />
      <NumberField source="remaining_budget" label="Remaining budget" />
      <TagChipsField source="tags" />
      <TextField source="description" />
    </SimpleShowLayout>
  </Show>
);

/** The landing page: the non-tabular surfaces a theme also has to get right. */
export const PreviewDashboard = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
    <Alert severity="info">
      Theme preview — fake data, no backend. Use the selector at the top right
      to switch variants.
    </Alert>
    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
      {[
        { label: "Jobs this month", value: "12,480" },
        { label: "Active projects", value: "37" },
        { label: "QPU hours used", value: "271.24" },
        { label: "Reserved hours", value: "146.50" },
      ].map((c) => (
        <Card key={c.label} sx={{ minWidth: 200, flex: "1 1 200px" }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {c.label}
            </Typography>
            <Typography variant="h2" sx={{ mt: 0.5 }}>
              {c.value}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
    <Card>
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Controls
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="contained">Primary</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
          <Button variant="contained" color="secondary">
            Secondary
          </Button>
          <Chip label="completed" color="success" />
          <Chip label="failed" color="error" />
          <Chip label="ready" />
        </Stack>
      </CardContent>
    </Card>
  </Box>
);
