import { useEffect } from "react";
import { BooleanInput, DateInput, required, useInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Box, FormHelperText, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { toDay, weekdayOf } from "./recurrence";

const DAYS = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
  [6, "Sat"],
  [7, "Sun"],
] as const;

const atLeastOneDay = (value: number[] | undefined) =>
  value && value.length > 0 ? undefined : "Pick at least one weekday";

const WeekdayInput = ({ source }: { source: string }) => {
  const {
    field,
    fieldState: { error, isTouched },
  } = useInput({ source, validate: atLeastOneDay, defaultValue: [] });
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        On
      </Typography>
      <ToggleButtonGroup
        size="small"
        value={field.value ?? []}
        onChange={(_, next: number[]) => field.onChange([...next].sort())}
        aria-label="Weekdays"
        sx={{ display: "flex", flexWrap: "wrap", mt: 0.5 }}
      >
        {DAYS.map(([n, label]) => (
          <ToggleButton key={n} value={n} aria-label={label} sx={{ px: 1.5 }}>
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {error && isTouched && <FormHelperText error>{error.message}</FormHelperText>}
    </Box>
  );
};

/**
 * "Repeat weekly" and the fields it needs, for a create form.
 *
 * `fromSource` is the field holding the first day. The slot form already has
 * one (`day`); the reservation form takes its date from the chosen slot, so in
 * repeat mode it gets a `from` field of its own and no slot picker — the
 * server finds each occurrence's slot.
 */
export const RecurrenceFields = ({ fromSource }: { fromSource: string }) => {
  const repeat = useWatch({ name: "repeat" });
  const from = useWatch({ name: fromSource });
  const weekdays = useWatch({ name: "weekdays" });
  const { setValue } = useFormContext();

  // Turning repetition on starts from the weekday of the chosen first day,
  // which is what "repeat this" most often means.
  useEffect(() => {
    if (repeat && from && (!weekdays || weekdays.length === 0)) {
      setValue("weekdays", [weekdayOf(toDay(from))]);
    }
  }, [repeat, from, weekdays, setValue]);

  return (
    <Box display="flex" flexDirection="column" gap={1} width="100%">
      <BooleanInput source="repeat" label="Repeat weekly" helperText={false} />
      {repeat && (
        <>
          {fromSource === "from" && <DateInput source="from" label="From" validate={required()} />}
          <WeekdayInput source="weekdays" />
          <DateInput source="until" label="Until (inclusive)" validate={required()} />
        </>
      )}
    </Box>
  );
};
