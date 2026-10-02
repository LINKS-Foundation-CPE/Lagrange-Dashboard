import { DeleteButton, useNotify } from "react-admin";
import { tagErrorMessage } from "./tagErrors";

/**
 * Deleting a tag is refused while any project still carries it, and that
 * refusal is the interesting case: it says how many projects, which is the
 * only place the admin can learn it.
 *
 * Hence `pessimistic` rather than react-admin's default `undoable` mode — an
 * undoable delete removes the row and reports success straight away, so the
 * 409 would arrive after the fact, about a tag no longer on screen.
 */
export const TagDeleteButton = () => {
  const notify = useNotify();

  return (
    <DeleteButton
      mutationMode="pessimistic"
      mutationOptions={{
        onError: (error: unknown) =>
          notify(tagErrorMessage(error, "Could not delete the tag"), {
            type: "error",
          }),
      }}
    />
  );
};
