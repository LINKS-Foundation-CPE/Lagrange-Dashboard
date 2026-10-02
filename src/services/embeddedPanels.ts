/**
 * Read-only pages the deployment runs beside the portal and embeds as panels.
 *
 * Both are public, unauthenticated pages on sibling subdomains, framed rather
 * than reimplemented so they stay owned by the monitoring stack that produces
 * them. A panel whose URL is not configured is not routed and not shown in the
 * menu, so a deployment without a monitoring stack simply does not have them.
 */

const trimmed = (value: string | undefined) => {
  const url = value?.trim();
  return url ? url : undefined;
};

/** Kener status page — incidents and uptime. */
export const MACHINE_STATUS_URL = trimmed(import.meta.env.VITE_MACHINE_STATUS_URL);

/** Perses-backed overview page — live machine metrics. */
export const MACHINE_METRICS_URL = trimmed(
  import.meta.env.VITE_MACHINE_METRICS_URL,
);

/**
 * User documentation. Linked out to rather than framed: it is a whole site with
 * its own navigation, which is exactly what made framing the status page a poor
 * fit.
 */
export const DOCS_URL = trimmed(import.meta.env.VITE_DOCS_URL);

/**
 * Monitors to show as status cards, as `tag` or `tag:Label`, comma-separated —
 * the tags configured in the Kener instance at MACHINE_STATUS_URL.
 *
 * Unset falls back to Kener's `_` pseudo-monitor, which aggregates every
 * active, non-hidden monitor. That works against any Kener instance without
 * configuration, so the panel is useful before anyone lists the tags.
 */
export interface StatusMonitor {
  tag: string;
  label?: string;
}

export const MACHINE_STATUS_MONITORS: StatusMonitor[] = (() => {
  const raw = trimmed(import.meta.env.VITE_MACHINE_STATUS_MONITORS);
  if (!raw) return [{ tag: "_", label: "All monitors" }];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [tag, ...rest] = entry.split(":");
      const label = rest.join(":").trim();
      return { tag: tag.trim(), label: label || undefined };
    });
})();
