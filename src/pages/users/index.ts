import PeopleIcon from '@mui/icons-material/People';

import { UserList } from './UserList';
import { UserCreate } from './BulkUserCreate';
import { UserShow } from './UserShow';
import { UserEdit } from './UserEdit';

export default {
    list: UserList,
    create: UserCreate,
    edit: UserEdit,
    show: UserShow,
    icon: PeopleIcon,
    recordRepresentation: 'email',
};