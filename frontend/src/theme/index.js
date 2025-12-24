// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d2a86c',        // Light brown (Tan) → matches Tailwind `primary`
      contrastText: '#000000' // Black text on buttons
    },
    secondary: {
      main: '#A0522D',        // Rich brown → matches Tailwind `secondary`
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FFFFFF',     // Page background → Tailwind `background.DEFAULT`
      paper: '#d6f4ea'        // Soft beige for cards/inputs → Tailwind `background.paper`
    },
    text: {
      primary: '#333333',     // Dark text → Tailwind `text.primary`
      secondary: '#000000'    // Black text → Tailwind `text.secondary`
    },
    navbar: {
      main: '#000000'         // Black navbar → Tailwind `navbar`
    },
    card: {
      main: '#F5F5DC',        // Soft beige card → Tailwind `card.DEFAULT`
      mint: '#98FF98'         // Mint card → Tailwind `card.mint`
    },
    buttonHover: {
      main: '#A0522D'         // Hover state for buttons → Tailwind `buttonHover`
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000', // Black navbar
          color: '#FFFFFF'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 700,
          transition: '0.3s ease',
          backgroundColor: '#d2a86c', // Primary tan
          color: '#000000',           // Black text
          '&:hover': {
            backgroundColor: '#A0522D', // Rich brown hover
            color: '#FFFFFF'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: '#F5F5DC', // Soft beige card
          color: '#333333'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#FFFFFF', // White input
            borderRadius: '8px',
            color: '#333333'
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#666666', // Subtle gray placeholder
            opacity: 1
          }
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#000000',
          textDecoration: 'none',
          transition: '0.3s ease',
          '&:hover': {
            color: '#A0522D',
            borderBottom: '2px solid #A0522D'
          }
        }
      }
    }
  }
});

export default theme;