import { defaultTheme } from "react-admin";
import { deepmerge } from "@mui/utils";
import type { ThemeOptions } from "@mui/material";

/**
 * The Lagrange theme.
 *
 * The palette is the one already in production on the Keycloak login screen,
 * so a user meets the same brand before and after signing in: navy app bar,
 * white sidebar, accent-blue actions, soft bordered cards on a light canvas.
 *
 * Built as MUI `ThemeOptions` merged onto react-admin's `defaultTheme`, which
 * is what the react-admin theming guide recommends: overriding rather than
 * replacing keeps every default the framework relies on.
 */

const BRAND = "#1a3a5c"; // deep navy — the login background
const ACCENT = "#1f5fae"; // the login button and card rule
const ACCENT_DARK = "#17478a";
const INK = "#12212f";
const MUTED = "#5b6b7c";
const LINE = "#e2e8ef";
const CANVAS = "#f5f7fa";

/** Shared by every variant: the palette, the type scale, sentence-case buttons. */
const base: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: ACCENT, dark: ACCENT_DARK, contrastText: "#ffffff" },
    secondary: { main: BRAND, contrastText: "#ffffff" },
    background: { default: CANVAS, paper: "#ffffff" },
    text: { primary: INK, secondary: MUTED },
    divider: LINE,
    success: { main: "#1e7a4b" },
    warning: { main: "#b06a00" },
    error: { main: "#b3261e" },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", Roboto, system-ui, -apple-system, sans-serif',
    h1: { fontSize: "1.75rem", fontWeight: 600 },
    h2: { fontSize: "1.45rem", fontWeight: 600 },
    h3: { fontSize: "1.2rem", fontWeight: 600 },
    h4: { fontSize: "1.05rem", fontWeight: 600 },
    h5: { fontSize: "1rem", fontWeight: 600 },
    h6: { fontSize: "0.95rem", fontWeight: 600 },
    // Shouting menu items and buttons is the single most dated thing about the
    // stock theme.
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    /*
     * Every <List> shows 25 rows instead of react-admin's 10. Set here rather
     * than on each list because <List> reads its props through MUI's
     * `useThemeProps` under the name `RaList`, so a theme default reaches all of
     * them — including any added later, which a per-list prop would miss.
     *
     * The tables on the Show pages are <ReferenceManyField>, which never had
     * this problem: ra-core's `usePaginationState` already defaults to 25.
     */
    RaList: {
      defaultProps: { perPage: 25 },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: MUTED, backgroundColor: CANVAS },
      },
    },
  },
};

export const lagrangeTheme: ThemeOptions = deepmerge(
  deepmerge(defaultTheme, base),
  {
    shape: { borderRadius: 8 },
    components: {
      MuiAppBar: {
        styleOverrides: {
          colorSecondary: { backgroundColor: BRAND, color: "#ffffff" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          elevation1: { boxShadow: "0 1px 2px rgba(18,33,47,0.06)" },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { border: `1px solid ${LINE}`, boxShadow: "none" },
        },
      },
      RaMenuItemLink: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            margin: "2px 8px",
            "&.RaMenuItemLink-active": {
              backgroundColor: "rgba(31,95,174,0.10)",
              color: ACCENT,
              fontWeight: 600,
              borderLeft: "none",
            },
          },
        },
      },
      RaDatagrid: {
        styleOverrides: {
          root: {
            "& .RaDatagrid-headerCell": {
              backgroundColor: CANVAS,
              borderBottom: `1px solid ${LINE}`,
            },
            "& .RaDatagrid-rowCell": { borderBottom: `1px solid ${LINE}` },
          },
        },
      },
    },
  } as ThemeOptions,
);
