import BookIcon from '@mui/icons-material/Book';

import { ProjectList } from './ProjectList';
import { ProjectCreate } from './ProjectCreate';
import { ProjectShow } from './ProjectShow';
import { ProjectEdit } from './ProjectEdit';

export default {
    list: ProjectList,
    create: ProjectCreate,
    edit: ProjectEdit,
    show: ProjectShow,
    icon: BookIcon,
    //recordRepresentation: (record) => `(Org ${record.organization_id}) ${record.name}`
};