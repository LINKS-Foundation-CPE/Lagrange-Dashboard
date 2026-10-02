import {
  useRecordContext,
  useNotify,
  useDataProvider,
  useGetList,
} from "react-admin";
import { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { formatDuration } from "../utils";
import { DurationInput } from "../components/DurationInput";

const BudgetTransferTab = () => {
  const org = useRecordContext(); // current organization record
  const notify = useNotify();
  const dataProvider = useDataProvider();

  const [sourceProject, setSourceProject] = useState<number | null>(null);
  const [destinationProject, setDestinationProject] = useState<number | null>(null);
  const [amount, setAmount] = useState(0);
  const [transferring, setTransferring] = useState(false);

  const { data: projects, isLoading, refetch } = useGetList("projects", {
    filter: { organization_id: org?.id },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "name", order: "ASC" },
  });

  const handleTransfer = async () => {
    const source = projects?.find((p) => p.id === sourceProject);
    if (!sourceProject || !destinationProject || !amount) {
      notify("Please fill all fields", { type: "warning" });
      return;
    }
    if (sourceProject === destinationProject) {
      notify("Source and destination must be different", { type: "warning" });
      return;
    }
    if (source && amount > Number(source.remaining_budget)) {
      notify("Amount exceeds source project budget", { type: "error" });
      return;
    }

    setTransferring(true);
    try {
      await dataProvider.budgetTransaction({
          organizationId: org?.id,
          sourceProjectId: sourceProject,
          destinationProjectId: destinationProject,
          amount: amount,
      });
      notify("Budget transferred successfully", { type: "info" });
      refetch();
      setDestinationProject(null);
    } catch (error: unknown) {
      notify(`Transfer failed: ${error instanceof Error ? error.message : error}`, { type: "error" });
    } finally {
      setTransferring(false);
    }
  };

  if (isLoading) return <p>Loading projects…</p>;

  return (
    <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
      <Typography variant="h6">Transfer Budget</Typography>

      <TextField
        select
        label="Source Project"
        value={sourceProject ?? ""}
        onChange={(e) => setSourceProject(Number(e.target.value))}
        fullWidth
      >
        {projects?.filter((prj) => Number(prj.remaining_budget) > 0).map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name} (Available: {formatDuration(p.remaining_budget ?? 0)})
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Destination Project"
        value={destinationProject ?? ""}
        onChange={(e) => setDestinationProject(Number(e.target.value))}
        fullWidth
      >
        {projects?.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name} (Available: {formatDuration(p.remaining_budget ?? 0)})
          </MenuItem>
        ))}
      </TextField>

      <DurationInput value={amount} onChange={setAmount} label="Amount" />

      <Button variant="contained" color="primary" onClick={handleTransfer} disabled={transferring}>
        {transferring ? "Transferring…" : "Transfer"}
      </Button>
    </Box>
  );
};

export default BudgetTransferTab;
