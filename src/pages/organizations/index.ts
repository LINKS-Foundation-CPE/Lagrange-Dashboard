import CorporateFareIcon from '@mui/icons-material/CorporateFare';

import OrganizationList from './OrganizationList';
import { OrganizationCreate } from './OrganizationCreate';
import { OrganizationShow } from './OrganizationShow';
import { OrganizationEdit } from './OrganizationEdit';

export default {
    list: OrganizationList,
    create: OrganizationCreate,
    edit: OrganizationEdit,
    show: OrganizationShow,
    icon: CorporateFareIcon,
};