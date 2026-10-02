import { AutocompleteInput, ReferenceInput } from 'react-admin';

export const OrganizationFilter = (<ReferenceInput source="organization_id" reference="organizations" alwaysOn >
        <AutocompleteInput
            optionText={(choice/* ?: Customer */) =>
                choice?.id // the empty choice is { id: '' }
                    ? `${choice.name}`
                    : ''
            }
            sx={{ minWidth: 200 }}
        />
    </ReferenceInput>)