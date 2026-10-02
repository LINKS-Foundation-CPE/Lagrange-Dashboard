import {
  DateTimeInput,
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  TimeInput,
  useDataProvider,
  SelectInput,
  required,
  useSaveContext,
} from "react-admin";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useFormContext, useWatch, type FieldValues } from "react-hook-form";
import { combineDateAndTime } from "../utils";
import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { RecurrenceFields } from "../series/RecurrenceFields";
import { useSeriesSubmit } from "../series/useSeriesSubmit";
import { browserZone, toDay, toTime } from "../series/recurrence";

const REDIRECT = "/reservations-calendar";

// No slot in a series request: the server finds the slot covering each
// occurrence, which is the point of asking it to.
const seriesBody = (values: Record<string, unknown>) => ({
  project_id: values.project_id,
  description: values.description ?? "",
  recurrence: {
    from: toDay(values.from),
    until: toDay(values.until),
    weekdays: values.weekdays,
    start_time: toTime(values.start),
    end_time: toTime(values.end),
    timezone: browserZone(),
  },
});

/**
 *
 * @param param0
 * @returns
 */
type SlotDateRef = RefObject<Date | string | null>;

const SlotWatcher = ({ slotDateRef }: { slotDateRef: SlotDateRef }) => {
  const { setValue } = useFormContext();
  const slotId = useWatch({ name: "slot_id" });
  const dataProvider = useDataProvider();

  useEffect(() => {
    if (!slotId) return;
    dataProvider.getOne("slots", { id: slotId }).then(({ data }) => {
      console.log("got slotz");
      console.log(data);
      if (data.start && data.end) {
        slotDateRef.current = data.day;

        const defaultStart = new Date(data.start);
        const defaultEnd = new Date(data.end);

        setValue("start", defaultStart);
        setValue("end", defaultEnd);
      }
    });
  }, [slotId, dataProvider, setValue]);

  return null;
};

const createTransform = (slotDateRef) => (data) => {
  const slotDate = slotDateRef.current;
  if (!slotDate) return data;

  // const mergeDateAndTime = (dateStr, time) => {
  //     if (!time) return null;
  //     const date = new Date(dateStr);
  //     const t = new Date(time);

  //     date.setHours(t.getHours());
  //     date.setMinutes(t.getMinutes());
  //     date.setSeconds(0);
  //     date.setMilliseconds(0);

  //     return date.toISOString();
  // };
  let day
  if (typeof slotDate.getMonth === 'function') {
      day = slotDate.toISOString().split('T')[0]
    }

  return {
    ...data,
    day,
    start: combineDateAndTime(slotDate, data.start),
    end: combineDateAndTime(slotDate, data.end),
  };
};

/** The slot picker, for a single reservation only — a series finds its own. */
const SingleSlotPicker = () =>
  useWatch({ name: "repeat" }) ? null : (
    <ReferenceInput source="slot_id" reference="slots">
      <SelectInput validate={[required()]} />
    </ReferenceInput>
  );

const ReservationCreateForm = ({ slotDateRef }: { slotDateRef: SlotDateRef }) => {
  const { save } = useSaveContext();
  const series = useSeriesSubmit("reservations", seriesBody, REDIRECT);
  return (
    <>
      <SimpleForm
        // One reservation goes through react-admin's own save, as before; a
        // series is previewed first and created from the preview.
        onSubmit={(values: FieldValues) => (values.repeat ? series.submit(values) : save?.(values))}
      >
        <SlotWatcher slotDateRef={slotDateRef} />
        <ReferenceInput source="project_id" reference="projects" filter={{ administrable: true }}>
          <SelectInput optionText="name" validate={[required()]} />
        </ReferenceInput>
        <SingleSlotPicker />
        <TimeInput source="start" validate={required()} />
        <TimeInput source="end" validate={required()} />
        <TextInput source="description" />
        <RecurrenceFields fromSource="from" />
      </SimpleForm>
      {series.dialog}
    </>
  );
};

export const ReservationCreate = () => {
  const slotDateRef = useRef<Date | string | null>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Create transform={createTransform(slotDateRef)} redirect={REDIRECT}>
        <Box display="flex" justifyContent="left" mt={2}>
          <ReservationCreateForm slotDateRef={slotDateRef} />
        </Box>
      </Create>
    </LocalizationProvider>
  );
};
