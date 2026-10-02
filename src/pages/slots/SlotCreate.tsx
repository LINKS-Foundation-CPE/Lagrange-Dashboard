import {
  Create,
  DateInput,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  required,
  useSaveContext,
} from "react-admin";
import { transformDateTimes } from "../utils";
import { HalfHourTimeInput } from "../components/HalfHourTimeInput";
import { Box } from "@mui/material";
import type { FieldValues } from "react-hook-form";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { RecurrenceFields } from "../series/RecurrenceFields";
import { useSeriesSubmit } from "../series/useSeriesSubmit";
import { browserZone, toDay, toTime } from "../series/recurrence";

const REDIRECT = "/slots-calendar";

const seriesBody = (values: Record<string, unknown>) => ({
  organization_id: values.organization_id,
  recurrence: {
    from: toDay(values.day),
    until: toDay(values.until),
    weekdays: values.weekdays,
    start_time: toTime(values.start),
    end_time: toTime(values.end),
    timezone: browserZone(),
  },
});

const SlotCreateForm = () => {
  const { save } = useSaveContext();
  const series = useSeriesSubmit("slots", seriesBody, REDIRECT);
  return (
    <>
      <SimpleForm
        // One slot goes through react-admin's own save, as before; a series is
        // previewed first and created from the preview.
        onSubmit={(values: FieldValues) => (values.repeat ? series.submit(values) : save?.(values))}
      >
        <ReferenceInput source="organization_id" reference="organizations">
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>
        <DateInput source="day" label="Day" validate={required()} />
        <HalfHourTimeInput source="start" label="Start Time" />
        <HalfHourTimeInput source="end" label="End Time" />
        <RecurrenceFields fromSource="day" />
      </SimpleForm>
      {series.dialog}
    </>
  );
};

export const SlotCreate = () => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <Create transform={transformDateTimes} redirect={REDIRECT}>
      <Box display="flex" justifyContent="left" mt={2}>
        <SlotCreateForm />
      </Box>
    </Create>
  </LocalizationProvider>
);
