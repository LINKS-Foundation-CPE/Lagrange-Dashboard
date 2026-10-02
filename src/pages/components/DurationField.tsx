import { useRecordContext } from "react-admin";
import { formatDuration } from "../utils";

export const DurationField = ({ source }: { source: string }) => {
  const record = useRecordContext();
  if (!record) return null;
  const value = record[source];
  return <span>{formatDuration(value)}</span>;
};

