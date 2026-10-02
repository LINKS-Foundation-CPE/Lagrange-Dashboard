import Keycloak, { KeycloakConfig, KeycloakInitOptions } from "keycloak-js";
import { LoginPage, keycloakAuthProvider } from "ra-keycloak";
import { jwtDecode } from "jwt-decode";
import { tokenService } from "./services/tokenService";

const config: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENTID,
};

const initOptions: KeycloakInitOptions = {
  onLoad: "check-sso",
  //silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
};

const keycloakClient = new Keycloak(config);

const baseAuthProvider = keycloakAuthProvider(keycloakClient, {
  initOptions,
});


let backendTokenPromise: Promise<void> | null = null;

// const fetchBackendTokenOnce = async () => {
//   console.log("fetchBackendTokenOnce");
//   if (backendTokenPromise) {
//     console.log("Backend token request already in progress.");
//     return backendTokenPromise;
//   }

//   backendTokenPromise = (async () => {
//     const keycloakToken = keycloakClient.token;
//     if (!keycloakToken) {
//       console.error("Missing Keycloak token");
//       throw new Error("Missing Keycloak token");
//     }

//     console.log("Fetching backend token...");

//     const res = await fetch(import.meta.env.VITE_TOKEN_URL, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${keycloakToken}`,
//       },
//     });

//     if (!res.ok) {
//       console.error("Backend token fetch failed");
//       throw new Error("Backend token fetch failed");
//     }

//     const { token } = await res.json();
//     tokenService.setToken(token);
//     //await localStorage.setItem("backendToken", token);
//     //sessionStorage.setItem('backendTokenExchanged', 'true');
//     console.log("Backend token fetched and stored.");
//   })();

//   try {
//     await backendTokenPromise;
//   } finally {
//     backendTokenPromise = null;
//   }
// };

const fetchBackendToken = async (): Promise<void> => {
  const keycloakToken = keycloakClient.token;
  if (!keycloakToken) {
    throw new Error("Cannot fetch backend token: Keycloak token is missing");
  }

  const res = await fetch(import.meta.env.VITE_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keycloakToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Backend token fetch failed with status ${res.status}`);
  }

  const { token } = await res.json();
  tokenService.setToken(token);
};

/**
 * Ensures only one backend token request is active at a time.
 */
const fetchBackendTokenOnce = (): Promise<void> => {
  if (backendTokenPromise) {
    return backendTokenPromise;
  }

  backendTokenPromise = fetchBackendToken().finally(() => {
    backendTokenPromise = null;
  });

  return backendTokenPromise;
};

const isBackendTokenValid = () => {
  console.log("isBackendTokenValid");
  const token = tokenService.getToken()
  if (!token) {
    console.log("isBackendTokenValid !token");
    return false;
  }

  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return Date.now() < (decoded.exp - 30) * 1000;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const authProvider = {
  ...baseAuthProvider,

  handleCallback: async (params: any) => {
    console.log("handleCallback");

    await baseAuthProvider.handleCallback?.(params);

    if (!isBackendTokenValid() /*  && !alreadyExchanged */) {
      await fetchBackendTokenOnce();
    }

    const identity = keycloakClient.tokenParsed?.email ?? "unknown";
    tokenService.setIdentity(identity);
  },

  checkAuth: async () => {
    console.log("checkAuth");

    if (isBackendTokenValid()) {
      console.log("checkAuth isBackendTokenValid");
      return;
    }

    // Backend token is missing or expired: try to recover before throwing
    // since Keycloak session may still be active
    if (keycloakClient.authenticated) {
      console.log("backend token invalid but keycloak session still active, fetching a new backend token")
      await fetchBackendTokenOnce();
      return;
    }

    console.log("checkAuth Not authenticated");
    throw new Error("Not authenticated");
  },

  checkError: async (error: any) => {
    console.error("checkError error: ", error);
    if (error.status === 401) {
      tokenService.clearToken()
      throw new Error();
    }
  },

  logout: async (params: any) => {
    console.log("logout");
    tokenService.clearToken()
    return baseAuthProvider.logout(params);
  },

  // getPermissions: async () => {
  //   const token = localStorage.getItem('backendToken');
  //   if (!token) throw new Error('Not authenticated');
  //   try {
  //     const decoded: any = jwtDecode(token);
  //     return decoded.roles || [];
  //   } catch {
  //     throw new Error('Failed to decode token');
  //   }
  // },

  getIdentity: async () => {
    const token = tokenService.getToken() 
    const identity = tokenService.getIdentity()

    if (!token || !identity) throw new Error("Identity not available");
    return { id: identity || "unknown", fullName: identity || "unknown" };
  },

  canAccess: async ({ resource, action, record }: any) => {
    const token = tokenService.getToken()
    if (!token) throw new Error("Not authenticated");

    try {
      const decoded = tokenService.decodeToken()
      const roles = decoded?.roles || [];

      // allow notifications for everybody
      if (resource === "notifications") {
        if (action === "delete") return false;
        return true;
      }

      if (resource === "jobs" && action === "list")
        return true;

      // The tag vocabulary is readable by anyone signed in — a project admin
      // needs the list to pick from — and writable by platform admins only.
      // Same split the backend enforces on /api/tags.
      if (resource === "tags") {
        if (action === "list" || action === "show") return true;
        return roles.includes("admin");
      }

      // Any authenticated user may look up organizations (list/show) so that
      // organization ReferenceFields resolve for regular users (e.g. the org
      // name in "My Projects"). Create/edit/delete stay restricted below.
      if (resource === "organizations" && (action === "list" || action === "show"))
        return true;

      // disabled actions
      switch (resource) {
        case "logs":
          if (action !== "list") return false;
          break;
        case "projects_users":
          if (action == "show" || action == "list") return false;
          if (roles.includes("admin") || roles.includes("organization-manager")) {
            return true;
          }
          // Allow PIs (project-admin) to add users to projects they administer.
          // The backend's authorizeByProjectAdmin enforces per-project scope.
          if (action == "create" && roles.includes("project-admin")) {
            return true;
          }
          break;
        case "projects":
        case "organizations":
        case "users":
          if (action == "delete") return false;
          if (action == "create" || action == "edit") {
            if (roles.includes("admin") || roles.includes("organization-manager")) {
            return true;
          }
          }
      }

      if (roles.includes("admin")) {
        // switch (resource) {
        //   case 'logs':
        //     if (action !== 'list')
        //       return false
        //     break
        //   case "projects":
        //     if (action == "delete")
        //       return false
        // }
        return true;
      }

      if (roles.includes("organization-manager")) {
        return (
          ["projects", "reservations", "organization_roles", "users"].includes(
            resource,
          ) ||
          (resource === "organizations" &&
            (action === "list" || action === "show"))
        );
      }

      if (roles.includes("project-admin")) {
        return (
          ["reservations", "projects_users"].includes(resource) ||
          // PIs may list/show and edit the projects they administer; the
          // backend (authorizeByProjectAdmin) enforces the per-project scope.
          (resource === "projects" &&
            (action === "list" || action === "show" || action === "edit"))
        );
      }
      return false;
    } catch (err) {
      console.error(err)
      return false;
    }
  },
};

export default authProvider;
export { LoginPage, keycloakClient };
