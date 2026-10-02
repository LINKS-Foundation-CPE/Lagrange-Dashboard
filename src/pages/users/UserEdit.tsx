import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  BooleanInput,
  Edit,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
} from "react-admin";
import { useBackendToken } from "../../hooks/useBackendToken";
import { DefaultProjectInput } from "../components/DefaultProjectInput";

export const UserEdit = () => {
  // const [decodedBackend, setDecodedBackend] = useState({roles:['']})

  //     useEffect(() => {
  //         const backendToken = localStorage.getItem('backendToken');
  //         if (backendToken) {
  //           const decoded = jwtDecode(backendToken);
  //           setDecodedBackend(decoded);
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
        <TextInput source="email" label="Username" />
        <BooleanInput source="organization_manager" />
        <BooleanInput source="organization_auditor" />
        <DefaultProjectInput />
        {/* Pulse (sweep) access. Normally mirrored from the identity provider
            at login; admins grant it here for users the IdP doesn't cover —
            e.g. HPC cluster accounts that never log in to the dashboard. */}
        {decodedToken.roles.includes("admin") && (
          <BooleanInput source="pulla_user" label="Pulse access" />
        )}
      </SimpleForm>
    </Edit>
  );
};
