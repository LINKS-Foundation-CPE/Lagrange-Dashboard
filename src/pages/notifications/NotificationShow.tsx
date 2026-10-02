import { useEffect, useRef } from "react";
import {
  BooleanField,
  DateField,
  Show,
  SimpleShowLayout,
  TextField,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "react-admin";

// Opening a notification marks it read (once), then refreshes so the bell
// badge and the list reflect the change.
const MarkReadOnView = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const done = useRef(false);

  useEffect(() => {
    if (record && !record.read && !done.current) {
      done.current = true;
      dataProvider
        .markNotificationAsRead(String(record.id))
        .then(() => refresh())
        .catch((e: unknown) => console.error("mark read failed", e));
    }
  }, [record, dataProvider, refresh]);

  return null;
};

export const NotificationShow = () => (
  <Show>
    <SimpleShowLayout>
      <MarkReadOnView />
      <DateField showTime source="timestamp" />
      <TextField source="type" />
      <TextField source="title" />
      <TextField source="description" />
      <BooleanField source="read" />
    </SimpleShowLayout>
  </Show>
);
