import WorkHistoryIcon from '@mui/icons-material/WorkHistory';

import { SlotList } from './SlotList';
import { SlotShow } from './SlotShow';
import { SlotCreate } from './SlotCreate';
import { SlotEdit } from './SlotEdit';

export default {
    list: SlotList,
    create: SlotCreate,
    edit: SlotEdit,
    show: SlotShow,
    icon: WorkHistoryIcon,
    recordRepresentation: (record: { day: any; start: any; end: any; }) => {
        const start = new Date(record.start)
        const end = new Date(record.end)
        return`${record.day} ${start.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}-${end.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}`
    },
};