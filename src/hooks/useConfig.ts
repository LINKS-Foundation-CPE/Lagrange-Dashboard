import { useEffect, useState } from "react";

export interface AppConfig {
  /**
   * When false, slot-less reservations are enabled and the slots-related
   * admin menu items should be hidden.
   */
  slotConstrainedReservations: boolean;
  /**
   * When true, the backend is a job viewer: the whole management surface
   * (projects, users, organizations, slots, reservations, logs, announcements,
   * notifications) is NOT MOUNTED and answers 404. The UI must hide it —
   * rendering a menu entry whose resource does not exist gives the user a page
   * of errors. See `policy.jobPortalOnly` in quantum-api.
   */
  jobPortalOnly: boolean;
  /**
   * False until `/config` has been read; the flags above hold their defaults
   * until then. Callers that mount or hide whole sections should wait for
   * this, or the user sees the full menu flash by before it disappears.
   */
  isLoaded: boolean;
}

const DEFAULTS: AppConfig = {
  slotConstrainedReservations: true,
  jobPortalOnly: false,
  isLoaded: false,
};

/**
 * Fetches the public backend configuration once.
 *
 * The endpoint is derived from the API base URL: VITE_API_URL is something
 * like `http://host:8500/api`, so resolving `/config` against it yields
 * `http://host:8500/config`. No authentication is required.
 *
 * Defaults to the historical behaviour (slots shown, full portal) while
 * loading and on error, so a backend that does not serve `/config` — or one
 * that is briefly unreachable — still gets a working UI.
 */
export function useConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>(DEFAULTS);

  useEffect(() => {
    let active = true;
    const url = new URL("/config", import.meta.env.VITE_API_URL).href;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Config fetch failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setConfig({
          slotConstrainedReservations:
            typeof data?.slotConstrainedReservations === "boolean"
              ? data.slotConstrainedReservations
              : DEFAULTS.slotConstrainedReservations,
          jobPortalOnly:
            typeof data?.jobPortalOnly === "boolean"
              ? data.jobPortalOnly
              : DEFAULTS.jobPortalOnly,
          isLoaded: true,
        });
      })
      .catch((err) => {
        console.error("useConfig", err);
        // Unblock the UI on the defaults rather than leaving it loading.
        if (active) setConfig({ ...DEFAULTS, isLoaded: true });
      });

    return () => {
      active = false;
    };
  }, []);

  return config;
}
