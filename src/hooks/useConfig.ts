import { useEffect, useState } from "react";

export interface AppConfig {
  /**
   * When false, slot-less reservations are enabled and the slots-related
   * admin menu items should be hidden.
   */
  slotConstrainedReservations: boolean;
}

/**
 * Fetches the public backend configuration once.
 *
 * The endpoint is derived from the API base URL: VITE_API_URL is something
 * like `http://host:8500/api`, so resolving `/config` against it yields
 * `http://host:8500/config`. No authentication is required.
 *
 * Defaults to `{ slotConstrainedReservations: true }` while loading and on
 * error, so slots are shown by default.
 */
export function useConfig(): AppConfig {
  const [config, setConfig] = useState<AppConfig>({
    slotConstrainedReservations: true,
  });

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
        if (active && typeof data?.slotConstrainedReservations === "boolean") {
          setConfig({
            slotConstrainedReservations: data.slotConstrainedReservations,
          });
        }
      })
      .catch((err) => {
        console.error("useConfig", err);
      });

    return () => {
      active = false;
    };
  }, []);

  return config;
}
