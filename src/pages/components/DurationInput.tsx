import { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { Duration } from "luxon";

interface DurationInputProps {
  value: number | ""; // milliseconds
  onChange: (ms: number) => void;
  label?: string;
}

export const DurationInput = ({ value, onChange, label }: DurationInputProps) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);

  // initialize from value (ms)
  useEffect(() => {
    if (value == null || value === "") return;
    const d = Duration.fromMillis(value).shiftTo("hours", "minutes", "seconds", "milliseconds");
    setHours(d.hours);
    setMinutes(d.minutes);
    setSeconds(d.seconds);
    setMilliseconds(d.milliseconds);
  }, [value]);

  const update = (h = hours, m = minutes, s = seconds, ms = milliseconds) => {
    const total = h * 3600000 + m * 60000 + s * 1000 + ms;
    onChange(total);
  };

  return (
    <Box display="flex" gap={1}>
      <TextField
        type="number"
        label="h"
        value={hours}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          setHours(val);
          update(val, minutes, seconds, milliseconds);
        }}
        size="small"
      />
      <TextField
        type="number"
        label="m"
        value={minutes}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          setMinutes(val);
          update(hours, val, seconds, milliseconds);
        }}
        size="small"
      />
      <TextField
        type="number"
        label="s"
        value={seconds}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          setSeconds(val);
          update(hours, minutes, val, milliseconds);
        }}
        size="small"
      />
      <TextField
        type="number"
        label="ms"
        value={milliseconds}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          setMilliseconds(val);
          update(hours, minutes, seconds, val);
        }}
        size="small"
      />
    </Box>
  );
};
