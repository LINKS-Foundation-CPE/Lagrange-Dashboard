import { useEffect, useState } from "react";
import { Title } from "react-admin";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  MACHINE_STATUS_MONITORS,
  MACHINE_STATUS_URL,
} from "../../services/embeddedPanels";

/**
 * Machine status, as cards rather than a framed status page.
 *
 * Framing the whole Kener site pulled in its navigation and its links, which
 * have nowhere sensible to go inside a panel. This shows only the state.
 *
 * The state comes from Kener's badge endpoints — `/badge/<tag>/{status,uptime}`
 * — which are SVG **images**. That matters: images are not subject to CORS, so
 * this needs no cross-origin permission and no proxy, unlike Kener's JSON API,
 * which the status host does not open to this origin. The badges are rendered
 * by Kener and carry the monitor's name, its state and its colour, so what is
 * shown here cannot drift from the status page itself.
 *
 * Badges are re-fetched on a timer with a cache-busting parameter, because the
 * endpoints send no cache headers and a browser would otherwise hold the first
 * image for the life of the page.
 */

const REFRESH_MS = 60_000;

const badge = (base: string, tag: string, kind: string, nonce: number) =>
  new URL(`/badge/${encodeURIComponent(tag)}/${kind}?t=${nonce}`, base).href;

export const MachineStatus = () => {
  const [nonce, setNonce] = useState(() => Date.now());
  // Held in a local so the guard below narrows it inside the map callback.
  const base = MACHINE_STATUS_URL;

  useEffect(() => {
    const id = setInterval(() => setNonce(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (!base) {
    return (
      <>
        <Title title="Machine Status" />
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            This panel is not configured for this deployment.
          </Typography>
        </Card>
      </>
    );
  }

  return (
    <>
      <Title title="Machine Status" />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            href={base}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
          >
            Full status page
          </Button>
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          {MACHINE_STATUS_MONITORS.map((monitor) => (
            <Card
              key={monitor.tag}
              sx={{ flex: "1 1 280px", minWidth: 260 }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
              >
                {monitor.label && (
                  <Typography variant="body2" color="text.secondary">
                    {monitor.label}
                  </Typography>
                )}
                <Box
                  component="img"
                  src={badge(base, monitor.tag, "status", nonce)}
                  alt={`${monitor.label ?? monitor.tag} status`}
                  sx={{ height: 20, alignSelf: "flex-start" }}
                />
                <Box
                  component="img"
                  src={badge(base, monitor.tag, "uptime", nonce)}
                  alt={`${monitor.label ?? monitor.tag} uptime`}
                  sx={{ height: 20, alignSelf: "flex-start" }}
                />
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Alert severity="info" variant="outlined">
          Incidents, history and maintenance windows live on the full status
          page.
        </Alert>
      </Box>
    </>
  );
};

export default MachineStatus;
