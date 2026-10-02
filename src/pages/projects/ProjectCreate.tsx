import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  DateInput,
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  required,
  minValue,
  BooleanInput,
} from "react-admin";
import { useBackendToken } from "../../hooks/useBackendToken";

export const ProjectCreate = () => {
  // const [decodedBackend, setDecodedBackend] = useState({roles:['']})

  // useEffect(() => {
  //     const backendToken = localStorage.getItem('backendToken');
  //     if (backendToken) {
  //       const decoded = jwtDecode(backendToken);
  //       setDecodedBackend(decoded);
  //       console.log('Decoded token:', decoded);
  //     }
  //   }, []);

  const decodedToken = useBackendToken();

  if (!decodedToken) {
    return <div>Loading...</div>;
  }

  return (
    <Create redirect="list">
      <SimpleForm>
        {decodedToken.roles.includes("admin") && (
          <ReferenceInput source="organization_id" reference="organizations" />
        )}

        <TextInput source="name" validate={required()} />
        <BooleanInput source="free_queue" />
        <NumberInput
          source="budget"
          validate={minValue(0, "Budget cannot be negative")}
          label={"Initial budget (hours)"}
        />
        <DateInput source="start_at" />
        <DateInput source="end_at" />
        {/* <NumberInput source="spent_budget" /> */}
      </SimpleForm>
    </Create>
  );
};
