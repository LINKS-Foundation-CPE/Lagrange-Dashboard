import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDataProvider, useNotify, useRedirect } from "react-admin";

const MAX_CONCURRENT = 3;

export type BatchUserCreationProgress = Record<
  string,
  { status: "pending" | "success" | "error"; error?: string }
>;

export const useBatchUserCreation = (resource: string, redirectPath?: string) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  const [progress, setProgress] = useState<BatchUserCreationProgress>({});
  const [isRunning, setIsRunning] = useState(false);
  const [contextData, setContextData] = useState<Record<string, any>>({});

  const mutation = useMutation({
    mutationFn: async (args: Record<string, any>) => {
      const { email, ...rest } = args;
      await dataProvider.create(resource, { data: { ...rest, email } });
      return email;
    },
    retry: 1,
  });

  const runBatch = async (emailList: string[], context: Record<string, any>) => {
    const queue = [...emailList];
    const running: Promise<void>[] = [];

    const runNext = async () => {
      if (queue.length === 0) return;

      const email = queue.shift()!;
      const p = mutation
        .mutateAsync({ ...context, email })
        .then(() => {
          setProgress((prev) => ({ ...prev, [email]: { status: "success" } }));
        })
        .catch((err: any) => {
          setProgress((prev) => ({
            ...prev,
            [email]: { status: "error", error: err?.message || "Failed" },
          }));
        })
        .finally(runNext);

      running.push(p);
      if (running.length > MAX_CONCURRENT) await Promise.race(running);
    };

    await Promise.all(Array.from({ length: MAX_CONCURRENT }).map(runNext));
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const { emails, ...rest } = values;
    const emailList = (emails || "")
      .split(/[,;\n]+/)
      .map((e: string) => e.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      notify("No valid usernames entered", { type: "warning" });
      return;
    }

    setContextData(rest);
    setProgress(Object.fromEntries(emailList.map((e) => [e, { status: "pending" }])));
    setIsRunning(true);

    await runBatch(emailList, rest);
    setIsRunning(false);

    const results = Object.values(progress);
    const successCount = results.filter((s) => s.status === "success").length;
    const errorCount = results.filter((s) => s.status === "error").length;

    if (errorCount === 0) {
      notify(`${successCount} users created successfully`, { type: "success" });
      if (redirectPath) redirect(redirectPath);
    } else {
      notify(`${successCount} users created, ${errorCount} failed`, { type: "warning" });
    }
  };

  const handleRetryFailed = async () => {
    const failedEmails = Object.entries(progress)
      .filter(([, v]) => v.status === "error")
      .map(([email]) => email);

    if (failedEmails.length === 0) {
      notify("No failed users to retry", { type: "info" });
      return;
    }

    setProgress((prev) => ({
      ...prev,
      ...Object.fromEntries(failedEmails.map((e) => [e, { status: "pending" }])),
    }));

    setIsRunning(true);
    await runBatch(failedEmails, contextData);
    setIsRunning(false);

    const results = Object.values(progress);
    const successCount = results.filter((s) => s.status === "success").length;
    const errorCount = results.filter((s) => s.status === "error").length;

    if (errorCount === 0) {
      notify(`${successCount} users created successfully`, { type: "success" });
      if (redirectPath) redirect(redirectPath);
    } else {
      notify(`${successCount} users created, ${errorCount} failed`, { type: "warning" });
    }
  };

  const total = Object.keys(progress).length;
  const successCount = Object.values(progress).filter((v) => v.status === "success").length;
  const errorCount = Object.values(progress).filter((v) => v.status === "error").length;
  const pendingCount = Object.values(progress).filter((v) => v.status === "pending").length;

  return {
    progress,
    isRunning,
    handleSubmit,
    handleRetryFailed,
    total,
    successCount,
    errorCount,
    pendingCount,
  };
};
