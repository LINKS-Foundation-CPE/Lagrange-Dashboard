import React from "react";
import ReactDOM from "react-dom/client";
import { PreviewApp } from "./PreviewApp";

/**
 * Entry point for the theme preview (`preview.html`).
 *
 * Requires VITE_API_URL to be set to *some* absolute URL, even a dead one:
 * useConfig builds `new URL("/config", VITE_API_URL)`, which throws on an
 * undefined base and takes the whole app down with "\"/config\" cannot be
 * parsed as a URL". Only the origin is used; the fetch is expected to fail and
 * useConfig falls back to its defaults.
 *
 * Seeds an unsigned token so the real CustomMenu, which reads roles from
 * localStorage, renders every section. jwt-decode does not verify, and nothing
 * here talks to a backend — this token is a fixture, not a credential.
 */
const b64 = (o: unknown) =>
  btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fixture = [
  b64({ alg: "none", typ: "JWT" }),
  b64({
    sub: "preview",
    id: 1,
    email: "preview@example.org",
    roles: [
      "admin",
      "organization-manager",
      "organization-auditor",
      "project-admin",
    ],
    organization: { id: 1, name: "LINKS Foundation" },
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
  }),
  "preview",
].join(".");

localStorage.setItem("backendToken", fixture);
localStorage.setItem("identity", "preview@example.org");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PreviewApp />
  </React.StrictMode>,
);
