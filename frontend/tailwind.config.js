/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#D97706",
        primaryDark: "#B45309",
        primarySoft: "#FEF3C7",

        background: {
          default: "#ffffffff",
          muted: "#ffffffff",
          dark: "#1F1F1F",
        },

        text: {
          primary: "#1C1C1C",
          secondary: "#4B4B4B",
          muted: "#6B6B6B",
          light: "#FFFFFF",
        },

        card: "#FFFFFF",
        cardSky: "#E0F2FE",

        border: "#E5E0D9",

        button: {
          DEFAULT: "#D97706",
          hover: "#B45309",
          ghost: "#FEF3C7",
        },

        accent: {
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
        },
      },

     backgroundImage: {
        'dashboard-gradient': 'linear-gradient(to bottom, #D1FAE5, #FEF3C7, #FFFFFF)',
        'card-gradient': 'linear-gradient(to bottom, #FEF3C7, #D97706)',
        'progress-gradient': 'linear-gradient(to right, #D1FAE5, #FEF3C7, #FFFFFF)'
     },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },

      boxShadow: {
        soft: "0 2px 8px rgba(28, 28, 28, 0.06)",
        card: "0 8px 24px rgba(28, 28, 28, 0.08)",
        hover: "0 12px 32px rgba(28, 28, 28, 0.12)",
      },

      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.4rem" }],
        sm: ["1rem", { lineHeight: "1.6rem" }],
        base: ["1.125rem", { lineHeight: "1.8rem" }],
        lg: ["1.375rem", { lineHeight: "2rem" }],
        xl: ["1.625rem", { lineHeight: "2.25rem" }],
        "2xl": ["2rem", { lineHeight: "2.5rem" }],
        "3xl": ["2.5rem", { lineHeight: "3rem" }],
        "4xl": ["3rem", { lineHeight: "3.5rem" }],
        "5xl": ["3.75rem", { lineHeight: "4rem" }],
      },
    },
  },
  plugins: [],
};
