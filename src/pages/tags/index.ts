import LocalOfferIcon from "@mui/icons-material/LocalOffer";

import { TagList } from "./TagList";
import { TagCreate } from "./TagCreate";
import { TagEdit } from "./TagEdit";

/**
 * No `show` view: a tag is an id and a name, so the list already shows
 * everything there is, and the row click goes to the edit form.
 */
export default {
  list: TagList,
  create: TagCreate,
  edit: TagEdit,
  icon: LocalOfferIcon,
  recordRepresentation: "name",
};
