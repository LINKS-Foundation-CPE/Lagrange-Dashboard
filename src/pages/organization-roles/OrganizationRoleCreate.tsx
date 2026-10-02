import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  DateInput,
  Create,
  NumberInput,
  ReferenceInput,
  SimpleForm,
  TextInput,
  useRedirect,
} from "react-admin";
import { useBackendToken } from "../../hooks/useBackendToken";

export const OrganizationRoleCreate = () => {
  const redirect = useRedirect();
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
    <Create
      mutationOptions={{
        onSuccess: (_data, _variables, context) => {
          // Example: go back to the parent organization
          redirect("show", "organizations", context?.organization_id);
        },
      }}
    >
      <SimpleForm>
        {decodedToken.roles.includes("admin") && (
          <ReferenceInput source="organization_id" reference="organizations" />
        )}
        <ReferenceInput source="user_id" reference="users" />
        <ReferenceInput source="role_id" reference="roles" />
      </SimpleForm>
    </Create>
  );
};
