// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  /* ================= MINIMAL PALETTE ================= */
  palette: {
    mode: "light",

    primary: {
      main: "#D97706",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#4B4B4B",
    },

    background: {
      default: "#F9FAF7",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#1C1C1C",
      secondary: "#4B4B4B",
    },

    divider: "#E5E0D9",

    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
  },

  /* ================= COMPONENT OVERRIDES ONLY ================= */
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1F1F1F",
          color: "#FFFFFF",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 700,
          backgroundColor: "#D97706",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#B45309",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "14px",
          backgroundColor: "#FFFFFF",
          color: "#1C1C1C",
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
          },
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: "#4B4B4B",
          textDecoration: "none",
          "&:hover": {
            color: "#B45309",
            borderBottom: "2px solid #B45309",
          },
        },
      },
    },
  },
});

export default theme;
