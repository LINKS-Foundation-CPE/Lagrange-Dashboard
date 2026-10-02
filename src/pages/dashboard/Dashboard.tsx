import {
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { Title, useAuthenticated } from "react-admin";

import Calendar from "../calendar";
import { useEffect, useState } from "react";
import ActiveAnnouncements from "../activeAnnouncements";
import { useBackendToken } from "../../hooks/useBackendToken";

export const Dashboard = () => {
  // const [decodedBackend, setDecodedBackend] = useState({
  //   roles: [],
  //   organization: null,
  // });
  const { isPending } = useAuthenticated(); // redirects to login if not authenticated

  // useEffect(() => {
  //   const backendToken = localStorage.getItem("backendToken");
  //   if (backendToken) {
  //     const decoded = jwtDecode(backendToken);
  //     setDecodedBackend(decoded);
  //     console.log("Decoded token:", decoded);
  //   }
  // }, []);

  const decodedToken = useBackendToken();

  if (!decodedToken) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <Title title="Dashboard" />
      <div>
        <br />
      </div>
      {/* <Card>
        <CardHeader title="Welcome to Spark Management" />
        <CardContent>
          {decodedToken.organization
            ? `Your organization: ${decodedToken.organization.name}`
            : "You have no organization defined"}
          <br />
          {decodedToken.roles.length
            ? `Your roles: ${decodedToken.roles}`
            : ""}
          <div>
            <br />
          </div>
        </CardContent>
      </Card>
      <div>
        <br />
      </div> */}
      <ActiveAnnouncements />
      {isPending ? (
        <div>Checking auth...</div>
      ) : (
        <>
          {/* Reservations calendar shown to every authenticated user so
              regular users can see when the machine is booked. */}
          <div>
            <br />
          </div>
          <Calendar userInfo={decodedToken} hideReservations={false} />
        </>
      )}
    </>
  );
};
