import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  /* ================= TYPOGRAPHY ================= */
  typography: {
    // This forces MUI components to use Poppins
    fontFamily: "'Poppins', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: "none" },
  },

  /* ================= PALETTE ================= */
  palette: {
    mode: "light",
    primary: {
      main: "#D97706", // Your primary orange
      dark: "#B45309",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#4B4B4B", // Your textSecondary color
    },
    background: {
      default: "#ffffff", // Matching your Tailwind background
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C1C1C", // Your textPrimary color
      secondary: "#4B4B4B",
    },
    divider: "#E5E0D9", // Your border color
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
  },

  /* ================= COMPONENT OVERRIDES ================= */
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          // Ensure the global body uses Poppins even when MUI injects styles
          fontFamily: "'Poppins', sans-serif !important", 
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1F1F1F", // Your backgroundDark
          color: "#FFFFFF",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px", // Consistent with your 'md' border radius
          padding: "8px 20px",
          // Using your theme colors for the buttons
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
          borderRadius: "14px", // Matches your 'lg' border radius
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputBase-root": {
            borderRadius: "10px",
          },
        },
      },
    },
  },
});

export default theme;