import { useState } from "react";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import {
  Button,
  Confirm,
  useDataProvider,
  useNotify,
  useRecordContext,
  useRedirect,
} from "react-admin";
import { formatDuration } from "../utils";

/**
 * Delete this occurrence's whole series — every *future* occurrence; past ones
 * stay as history. Shown only on records that were created as a series.
 */
export const SeriesDeleteButton = ({
  kind,
  redirectTo,
}: {
  kind: "slots" | "reservations";
  redirectTo: string;
}) => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!record?.series_id) return null;
  const noun = kind === "slots" ? "slots" : "reservations";

  const handleConfirm = async () => {
    setBusy(true);
    try {
      const { data } = await dataProvider.deleteSeries(kind, record.series_id);
      notify(
        `Deleted ${data.deleted} future ${noun}` +
          (data.refunded_ms != null ? `, ${formatDuration(data.refunded_ms)} refunded` : "") +
          (data.kept_past ? ` (${data.kept_past} past kept)` : ""),
        { type: "success" },
      );
      redirect(redirectTo);
    } catch (error) {
      notify((error as Error).message || "Could not delete the series", { type: "error" });
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button label="Delete series" onClick={() => setOpen(true)} color="error">
        <EventRepeatIcon />
      </Button>
      <Confirm
        isOpen={open}
        loading={busy}
        title="Delete the whole series?"
        content={
          kind === "reservations"
            ? "Every future reservation of this series will be deleted and refunded — in full more than 24 hours ahead, a quarter of it closer than that. Past ones are kept."
            : "Every future slot of this series will be deleted. Past ones are kept. If any of them holds a reservation, nothing is deleted."
        }
        confirm="Delete series"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
