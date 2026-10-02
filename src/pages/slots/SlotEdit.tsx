import {
  DateInput,
  DateTimeInput,
  Edit,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  TimeInput,
} from "react-admin";
import { transformDateTimes } from "../utils";
import { HalfHourTimeInput } from "../components/HalfHourTimeInput";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { Box } from "@mui/material";

export const SlotEdit = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Edit
        transform={transformDateTimes}
        redirect="/slots-calendar"
        mutationMode="pessimistic"
      >
        <Box display="flex" justifyContent="left" mt={2}>
          <SimpleForm>
            <ReferenceInput
              source="organization_id"
              reference="organizations"
            />
            <DateInput source="day" />
            {/* <TimeInput source="start" />
            <TimeInput source="end" /> */}
            <HalfHourTimeInput source="start" label="Start Time" />
            <HalfHourTimeInput source="end" label="End Time" />
          </SimpleForm>
        </Box>
      </Edit>
    </LocalizationProvider>
  );
};
