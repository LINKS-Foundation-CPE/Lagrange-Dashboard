import CampaignIcon from '@mui/icons-material/Campaign';

import { AnnouncementList } from './AnnouncementList';
import { AnnouncementShow } from './AnnouncementShow';
import { AnnouncementCreate } from './AnnouncementCreate';
import { AnnouncementEdit } from './AnnouncementEdit';

export default {
    list: AnnouncementList,
    create: AnnouncementCreate,
    edit: AnnouncementEdit,
    show: AnnouncementShow,
    icon: CampaignIcon,
    // recordRepresentation: (record: { day: any; start: any; end: any; }) => {
    //     const start = new Date(record.start)
    //     const end = new Date(record.end)
    //     return`${record.day} ${start.toLocaleTimeString('en-GB', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: false,
    //       })}-${end.toLocaleTimeString('en-GB', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //         hour12: false,
    //       })}`
    // },
};