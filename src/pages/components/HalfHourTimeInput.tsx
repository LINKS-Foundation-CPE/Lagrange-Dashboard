import { useInput, FieldTitle } from "react-admin";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DateTime } from "luxon";

interface HalfHourTimeInputProps {
  source: string;
  label?: string;
}

export const HalfHourTimeInput = ({ source, label }: HalfHourTimeInputProps) => {
  const {
    field,
    fieldState: { error },
  } = useInput({ source });

  return (
    <TimePicker
      label={<FieldTitle label={label} source={source} />}
      value={DateTime.fromJSDate(new Date(field.value)) || null}
      onChange={(newValue) => field.onChange(newValue)}
      minutesStep={30} // only allow full or half hours
      timeSteps={{ hours: 1, minutes: 30 }} // only show full or half hours
      ampm={false}      // 24h format
      slotProps={{
        textField: {
            variant: "outlined",
            size: "small",
            fullWidth: true,
        },
    }}
    />
  );
};
