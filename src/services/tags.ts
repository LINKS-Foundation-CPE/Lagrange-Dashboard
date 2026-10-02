/**
 * The tag vocabulary, as the API models it.
 *
 * Tags are a controlled vocabulary: platform admins own the list, and a
 * project can only carry terms that are already in it. Assignment is a project
 * sub-resource (`PUT /api/projects/:id/tags`) and never a field on the project
 * update body — `PUT /api/projects/:id` is admin and organization-manager
 * only, while assignment is open to the project's own admins, so the two
 * cannot share a request without handing a PI the budget and the dates too.
 */

export interface Tag {
  id: number;
  name: string;
}

const isTag = (value: unknown): value is Tag =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { id?: unknown }).id === "number" &&
  typeof (value as { name?: unknown }).name === "string";

/**
 * Projects arrive from the API with their tags already attached, so a list of
 * rows renders chips without a request per row. The value comes out of JSON
 * untyped; this narrows it and drops anything that is not a tag rather than
 * throwing inside a table cell.
 */
export const readTags = (value: unknown): Tag[] =>
  Array.isArray(value) ? value.filter(isTag) : [];

/**
 * Alphabetical. The vocabulary endpoint already sorts by name; a project's own
 * tags come back in association order, which is arbitrary and would make the
 * same set of chips appear in a different order on every page.
 */
export const sortTags = (tags: Tag[]): Tag[] =>
  [...tags].sort((a, b) => a.name.localeCompare(b.name));

/** Whether two tag sets are the same, order ignored — a dirty check. */
export const sameTags = (a: Tag[], b: Tag[]): boolean => {
  if (a.length !== b.length) return false;
  const left = a.map((tag) => tag.id).sort((x, y) => x - y);
  const right = b.map((tag) => tag.id).sort((x, y) => x - y);
  return left.every((id, index) => id === right[index]);
};
