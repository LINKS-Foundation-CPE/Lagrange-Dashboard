import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import {
  BooleanInput,
  DateInput,
  Edit,
  minValue,
  NumberInput,
  ReferenceInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";
import { useBackendToken } from "../../hooks/useBackendToken";

export const ProjectEdit = () => {
  // const [decodedBackend, setDecodedBackend] = useState({roles:['']})

  //     useEffect(() => {
  //         const backendToken = localStorage.getItem('backendToken');
  //         if (backendToken) {
  //           const decoded = jwtDecode(backendToken);
  //           setDecodedBackend(decoded);
  //           console.log('Decoded token:', decoded);
  //         }
  //       }, []);

  const decodedToken = useBackendToken();

  if (!decodedToken) {
    return <div>Loading...</div>;
  }

  return (
    <Edit mutationMode="pessimistic">
      <SimpleForm>
        {decodedToken.roles.includes("admin") && (
          <ReferenceInput source="organization_id" reference="organizations" />
        )}
        <TextInput source="name" validate={required()} />
        <DateInput source="start_at" />
        <DateInput source="end_at" />
        <BooleanInput source="free_queue" />
        {/* <NumberInput source="total_budget" validate={minValue(0, 'Budget cannot be negative')} /> */}
        {/* <NumberInput source="spent_budget" /> */}
      </SimpleForm>
    </Edit>
  );
};
