import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router';
import { App } from "./App";

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    {/* <App /> */}
  </React.StrictMode>,
);
