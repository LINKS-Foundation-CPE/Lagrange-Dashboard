import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import {
  Edit,
  ReferenceInput,
  SimpleForm,
  TextInput,
  TimeInput,
} from "react-admin";

export const ReservationEdit = () => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <Edit redirect="/reservations-calendar" mutationMode="pessimistic">
      <Box display="flex" justifyContent="left" mt={2}>
        <SimpleForm>
          <ReferenceInput source="project_id" reference="projects" />
          <ReferenceInput source="slot_id" reference="slots" />
          <TimeInput source="start" />
          <TimeInput source="end" />
          <TextInput source="description" />
        </SimpleForm>
      </Box>
    </Edit>
  </LocalizationProvider>
);
