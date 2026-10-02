import { DataTable, List, TextField } from "react-admin";
import { TagDeleteButton } from "./TagDeleteButton";

/**
 * The vocabulary itself. Deliberately without bulk actions: a bulk delete
 * reports one failure for the whole selection, and what an admin needs to be
 * told here is *which* tag is still assigned and to how many projects.
 */
export const TagList = () => (
  <List sort={{ field: "name", order: "ASC" }} exporter={false}>
    <DataTable bulkActionButtons={false}>
      <DataTable.Col source="id" />
      <DataTable.Col source="name">
        <TextField source="name" />
      </DataTable.Col>
      <DataTable.Col label="" disableSort>
        <TagDeleteButton />
      </DataTable.Col>
    </DataTable>
  </List>
);
