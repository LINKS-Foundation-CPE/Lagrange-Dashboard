import { keycloakClient } from "../authProvider";

// The client the user is signed in with. The token handed out below is issued
// for it, so the page can name it.
const TOKEN_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENTID;

/**
 * Access token for the QC Gateway, taken from the session the user is already
 * signed in with.
 *
 * There is no dedicated Keycloak client here. The gateway validates the realm
 * signature, the issuer, and `aud` against its `AUDIENCE` setting, which is
 * `account` — every client's access token in the realm carries that audience,
 * so a token issued for the dashboard's own client is accepted exactly like one
 * issued for a machine-specific client, and needs no Keycloak configuration
 * beyond what signing in already requires.
 *
 * This used to run a second keycloak-js instance against an `iqm_client`
 * client and mint a token through a silent check-sso. That client is not
 * configured for browser use at the dashboard origin in any deployment — the
 * session-status iframe answered 403 and the silent redirect URI was rejected —
 * and keycloak-js reports both as a bare `undefined`, which is what the page
 * showed. Nothing was gained by the second client that would justify
 * configuring it.
 */
export async function getIqmToken(): Promise<string> {
  if (!keycloakClient.authenticated) {
    throw new Error("Not signed in");
  }

  try {
    await keycloakClient.updateToken(60);
  } catch (cause) {
    // keycloak-js rejects with a bare `undefined` when there is no refresh
    // token, so there is nothing to report from the cause itself. Only fatal
    // if the token in hand has actually expired; otherwise it is still good.
    console.error("Refreshing the access token failed", cause);
    if (keycloakClient.isTokenExpired(0)) {
      throw new Error(
        "Your session expired while getting the token. Reload the page and sign in again.",
      );
    }
  }

  const token = keycloakClient.token;
  if (!token) {
    throw new Error("No access token in the current session");
  }
  return token;
}

export { TOKEN_CLIENT_ID };
