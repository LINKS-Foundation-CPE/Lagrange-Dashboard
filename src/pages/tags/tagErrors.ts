/**
 * Turning an API refusal about tags into something an admin can act on.
 *
 * Two of them carry information that exists nowhere else in the UI: creating a
 * duplicate name is a 409 naming the name, and deleting a tag a project still
 * carries is a 409 saying how many projects. react-admin's default handler
 * falls back to a generic "An error occurred" whenever it does not recognise
 * the failure, which throws away exactly the part the admin needs — so for the
 * statuses whose message the backend writes for a human, that message is what
 * gets shown.
 */

interface ApiErrorShape {
  status?: number;
  message?: string;
  body?: { message?: string };
}

/**
 * Statuses whose message is written for the operator rather than for a log.
 * 409 is the duplicate name and the still-assigned tag; 400 is an id outside
 * the vocabulary, which can only happen if the picker went stale.
 */
const OPERATOR_STATUSES = new Set([400, 409]);

const asApiError = (error: unknown): ApiErrorShape =>
  typeof error === "object" && error !== null ? (error as ApiErrorShape) : {};

/**
 * `fallback` is what to say when the failure is not one of the meaningful
 * ones — a 500, a dropped connection, an HTML error page from a proxy — whose
 * body is not fit to put in front of a user.
 */
export const tagErrorMessage = (error: unknown, fallback: string): string => {
  const { status, message, body } = asApiError(error);
  const detail = body?.message ?? message;

  if (status !== undefined && OPERATOR_STATUSES.has(status) && detail) {
    // Already a whole sentence, e.g. `tag "chemistry" already exists` or
    // `tag "x" is assigned to 3 project(s); remove it from them first`.
    return detail.charAt(0).toUpperCase() + detail.slice(1);
  }

  if (status === 403) {
    return `${fallback}: you are not allowed to do that.`;
  }

  return detail ? `${fallback}: ${detail}` : fallback;
};
