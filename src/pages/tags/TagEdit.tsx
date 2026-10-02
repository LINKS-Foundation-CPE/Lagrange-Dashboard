import {
  Edit,
  maxLength,
  required,
  SaveButton,
  SimpleForm,
  TextInput,
  Toolbar,
  useNotify,
} from "react-admin";
import { TagDeleteButton } from "./TagDeleteButton";
import { tagErrorMessage } from "./tagErrors";

/**
 * The stock toolbar's delete button is undoable, which would hide the
 * still-assigned 409 behind a success notification. Same button as the list.
 */
const TagEditToolbar = () => (
  <Toolbar>
    <SaveButton />
    <TagDeleteButton />
  </Toolbar>
);

/**
 * Pessimistic: renaming to a name that is taken is a 409, and an optimistic or
 * undoable save would show the new name in the list before finding that out.
 */
export const TagEdit = () => {
  const notify = useNotify();

  return (
    <Edit
      mutationMode="pessimistic"
      mutationOptions={{
        onError: (error: unknown) =>
          notify(tagErrorMessage(error, "Could not rename the tag"), {
            type: "error",
          }),
      }}
    >
      <SimpleForm toolbar={<TagEditToolbar />}>
        <TextInput
          source="name"
          validate={[required(), maxLength(64)]}
          helperText="Renaming a tag renames it on every project that carries it."
        />
      </SimpleForm>
    </Edit>
  );
};
