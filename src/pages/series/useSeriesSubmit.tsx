import { useState } from "react";
import { useDataProvider, useNotify, useRedirect } from "react-admin";
import { SeriesPreviewDialog } from "./SeriesPreviewDialog";
import { SeriesResult } from "./recurrence";

/**
 * Preview-then-create for a series: `submit(values)` asks the API for a dry
 * run and opens the preview; confirming creates it and returns to `redirectTo`.
 */
export const useSeriesSubmit = (
  kind: "slots" | "reservations",
  buildBody: (values: Record<string, unknown>) => object,
  redirectTo: string,
) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const [body, setBody] = useState<object | null>(null);
  const [result, setResult] = useState<SeriesResult | null>(null);
  const [busy, setBusy] = useState(false);

  const call = async (payload: object): Promise<SeriesResult | null> => {
    setBusy(true);
    try {
      const { data } = await dataProvider.createSeries(kind, payload);
      return data as SeriesResult;
    } catch (error) {
      notify((error as Error).message || "Could not reach the server", { type: "error" });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const submit = async (values: Record<string, unknown>) => {
    const next = buildBody(values);
    setBody(next);
    const preview = await call({ ...next, dry_run: true });
    if (preview) setResult(preview);
  };

  const confirm = async (skipConflicts: boolean) => {
    if (!body) return;
    const done = await call({ ...body, skip_conflicts: skipConflicts });
    if (!done) return;
    if (done.outcome === "created") {
      const skipped = done.summary.conflicts;
      notify(
        `Created ${done.created.length} ${kind === "slots" ? "slot" : "reservation"}(s)` +
          (skipped ? `, skipped ${skipped}` : ""),
        { type: "success" },
      );
      setResult(null);
      redirect(redirectTo);
    } else {
      // Something changed since the preview — show the fresh report instead.
      setResult(done);
    }
  };

  const dialog = (
    <SeriesPreviewDialog
      kind={kind}
      result={result}
      busy={busy}
      onCancel={() => setResult(null)}
      onConfirm={confirm}
    />
  );

  return { submit, dialog, busy };
};
