import { BooleanInput, Filter } from 'react-admin';

const OldRecordsFilter = (props) => (
    <Filter {...props}>
        <BooleanInput source="showOld" label="Show past records" alwaysOn />
    </Filter>
);


export {OldRecordsFilter}