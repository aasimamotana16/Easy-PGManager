// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',

    // Tailwind primary colors
    primary: {
      main: '#D97706',        // Tailwind primary
      dark: '#B45309',        // Tailwind primaryDark
      light: '#FEF3C7',       // Tailwind primarySoft
      contrastText: '#FFFFFF' // White text on primary buttons
    },

    // Secondary can map to accent.warning or another semantic color
    secondary: {
      main: '#4B4B4B',        // Tailwind text.secondary
      contrastText: '#FFFFFF'
    },

    // Backgrounds
    background: {
      default: '#F9FAF7',     // Tailwind background.DEFAULT
      paper: '#F5F3F1',       // Tailwind background.muted
    },

    // Text colors
    text: {
      primary: '#1C1C1C',     // Tailwind text.primary
      secondary: '#4B4B4B',   // Tailwind text.secondary
      disabled: '#6B6B6B'     // Tailwind text.muted
    },

    // Cards
    card: {
      main: '#FFFFFF',        // Tailwind card
      sky: '#E0F2FE'          // Tailwind cardSky
    },

    // Borders
    divider: '#E5E0D9',       // Tailwind border

    // Buttons
    button: {
      main: '#D97706',        // Tailwind button.DEFAULT
      hover: '#B45309',       // Tailwind button.hover
      ghost: '#FEF3C7'        // Tailwind button.ghost
    },

    // Accents
    success: {
      main: '#16A34A'         // Tailwind accent.success
    },
    warning: {
      main: '#D97706'         // Tailwind accent.warning
    },
    error: {
      main: '#DC2626'         // Tailwind accent.danger
    }
  },

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1F1F1F', // Tailwind background.dark
          color: '#FFFFFF'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',        // Tailwind borderRadius.md
          textTransform: 'none',
          fontWeight: 700,
          transition: '0.3s ease',
          backgroundColor: '#D97706',  // Tailwind button.DEFAULT
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#B45309', // Tailwind button.hover
            color: '#FFFFFF'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '14px',        // Tailwind borderRadius.lg
          backgroundColor: '#FFFFFF',  // Tailwind card
          color: '#1C1C1C'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',      // Tailwind borderRadius.md
            color: '#1C1C1C'
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#6B6B6B',          // Tailwind text.muted
            opacity: 1
          }
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#4B4B4B',            // Tailwind text.secondary
          textDecoration: 'none',
          transition: '0.3s ease',
          '&:hover': {
            color: '#B45309',          // Tailwind primaryDark
            borderBottom: '2px solid #B45309'
          }
        }
      }
    }
  }
});

export default theme;