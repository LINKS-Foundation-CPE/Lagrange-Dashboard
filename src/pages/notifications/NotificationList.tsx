import {
  DataTable,
  DateField,
  List,
  TopToolbar,
  useDataProvider,
  useListContext,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { Button, Chip } from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";

const ReadStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;
  return record.read ? (
    <Chip label="Read" size="small" variant="outlined" />
  ) : (
    <Chip label="Unread" size="small" color="primary" />
  );
};

// Marks every currently-listed unread notification as read.
const MarkAllReadButton = () => {
  const { data } = useListContext();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();
  const notify = useNotify();
  const unread = (data || []).filter((n) => !n.read);
  return (
    <Button
      startIcon={<DoneAllIcon />}
      disabled={unread.length === 0}
      onClick={async () => {
        // allSettled, not all: one rejection used to discard the outcome of
        // every other request, so a partly-successful run reported plain
        // failure and the refresh never happened.
        const results = await Promise.allSettled(
          unread.map((n) => dataProvider.markNotificationAsRead(String(n.id))),
        );
        refresh();

        const failures = results.filter(
          (r): r is PromiseRejectedResult => r.status === "rejected",
        );
        if (failures.length === 0) {
          notify(`Marked ${unread.length} notification(s) as read`, {
            type: "info",
          });
          return;
        }
        // The reason carries the status and message from the API; swallowing
        // it is what made this failure impossible to diagnose from either end.
        console.error(
          "Mark all as read: %d of %d failed",
          failures.length,
          unread.length,
          failures.map((f) => f.reason),
        );
        const [first] = failures;
        const detail =
          first.reason instanceof Error ? `: ${first.reason.message}` : "";
        notify(
          `Marked ${unread.length - failures.length} of ${unread.length}; ` +
            `${failures.length} failed${detail}`,
          { type: "warning" },
        );
      }}
    >
      Mark all as read
    </Button>
  );
};

const NotificationActions = () => (
  <TopToolbar>
    <MarkAllReadButton />
  </TopToolbar>
);

export const NotificationList = () => (
  <List
    sort={{ field: "timestamp", order: "DESC" }}
    actions={<NotificationActions />}
  >
    <DataTable bulkActionButtons={false}>
      <DataTable.Col source="timestamp">
        <DateField showTime source="timestamp" />
      </DataTable.Col>
      <DataTable.Col source="title" />
      <DataTable.Col source="description" />
      <DataTable.Col source="read" label="Status">
        <ReadStatusField />
      </DataTable.Col>
    </DataTable>
  </List>
);
