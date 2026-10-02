import { Title } from "react-admin";
import { Box, Button, Card, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface EmbeddedPanelProps {
  title: string;
  url?: string;
}

/**
 * The floor for the frame, in pixels.
 *
 * The embedded page lays itself out against `100vh` with `overflow: hidden` —
 * it is built as a wall display, one screen, no scrolling — and inside a frame
 * `100vh` is the frame's height. So a short window does not make the page
 * scroll, it makes every row of it compress until the readings are unreadable.
 * Below roughly this height that is what happens, so the frame stops shrinking
 * here and the portal page scrolls instead.
 */
const MIN_FRAME_HEIGHT = 800;

/**
 * A sibling page shown inside the portal.
 *
 * The frame is cross-origin — a different subdomain — so nothing here can read
 * or drive the embedded page, and it cannot read the portal. That is the point:
 * the monitoring stack keeps owning its own page. The "Open in new tab" escape
 * hatch matters more than it looks; an embedded page that misbehaves in a frame
 * is still one click from being useful.
 */
export const EmbeddedPanel = ({ title, url }: EmbeddedPanelProps) => {
  if (!url) {
    return (
      <>
        <Title title={title} />
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
      <Title title={title} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          // The frame should fill what is left of the window below the app bar.
          // The offset covers the app bar and the page padding; below the
          // minimum the frame keeps its height and the page scrolls, rather
          // than the embedded page compressing to fit (see MIN_FRAME_HEIGHT).
          height: "calc(100vh - 8rem)",
          minHeight: MIN_FRAME_HEIGHT,
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            size="small"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon />}
          >
            Open in new tab
          </Button>
        </Box>
        <Card sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <Box
            component="iframe"
            src={url}
            title={title}
            sx={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        </Card>
      </Box>
    </>
  );
};
