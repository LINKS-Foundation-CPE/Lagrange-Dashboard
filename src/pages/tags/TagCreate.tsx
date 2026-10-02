import {
  Create,
  maxLength,
  required,
  SimpleForm,
  TextInput,
  useNotify,
} from "react-admin";
import { tagErrorMessage } from "./tagErrors";

/**
 * `mutationOptions.onError` replaces react-admin's default error notification,
 * which would reduce the duplicate-name 409 to "An error occurred"; the
 * default success behaviour (notify and redirect to the list) is left alone.
 */
export const TagCreate = () => {
  const notify = useNotify();

  return (
    <Create
      mutationOptions={{
        onError: (error: unknown) =>
          notify(tagErrorMessage(error, "Could not create the tag"), {
            type: "error",
          }),
      }}
    >
      <SimpleForm>
        <TextInput
          source="name"
          validate={[required(), maxLength(64)]}
          helperText="Project admins can only pick from this list, so prefer a term that will read the same on every project. Names are unique."
        />
      </SimpleForm>
    </Create>
  );
};
