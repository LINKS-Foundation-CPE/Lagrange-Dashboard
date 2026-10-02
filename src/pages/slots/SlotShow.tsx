import {
  DateField,
  EditButton,
  ReferenceField,
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
} from "react-admin";
import { SeriesDeleteButton } from "../series/SeriesDeleteButton";

const SlotShowActions = () => (
  <TopToolbar>
    <EditButton />
    <SeriesDeleteButton kind="slots" redirectTo="/slots-calendar" />
  </TopToolbar>
);

export const SlotShow = () => (
  <Show actions={<SlotShowActions />}>
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="organization_id" reference="organizations" />
      <DateField source="day" />
      <DateField showTime showDate={false} source="start" />
      <DateField showTime showDate={false} source="end" />
    </SimpleShowLayout>
  </Show>
);
