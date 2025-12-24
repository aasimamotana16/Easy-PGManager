/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ===== BRAND / PRIMARY ===== */
        primary: "#D97706",       // Warm amber for headings/buttons
        primaryDark: "#B45309",   // Hover states for buttons/links
        primarySoft: "#FEF3C7",   // Soft background accent

        /* ===== BACKGROUNDS ===== */
        background: {
          DEFAULT: "#F9FAF7",     // Main page background (soft white)
          muted: "#F5F3F1",       // Section separation / subtle panels
          dark: "#1F1F1F",        // Navbar / footer dark mode
        },

        /* ===== TEXT ===== */
        text: {
          primary: "#1C1C1C",     // Main headings
          secondary: "#4B4B4B",   // Paragraphs / content
          muted: "#6B6B6B",       // Labels / helper text
          light: "#FFFFFF",        // On dark background
        },

        /* ===== CARDS ===== */
        card: "#FFFFFF",           // White cards
        cardSky: "#E0F2FE",       // Sky blue cards

        /* ===== BORDERS ===== */
        border: "#E5E0D9",        // Light beige border

        /* ===== BUTTONS ===== */
        button: {
          DEFAULT: "#D97706",     // Amber
          hover: "#B45309",       // Darker amber
          ghost: "#FEF3C7",       // Soft button background
        },

        /* ===== STATUS / ACCENTS ===== */
        accent: {
          success: "#16A34A",     // Green
          warning: "#D97706",     // Amber
          danger: "#DC2626",      // Red
        },
      },

      /* ===== BORDER RADIUS ===== */
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
      },

      /* ===== SHADOWS ===== */
      boxShadow: {
        soft: "0 2px 8px rgba(28, 28, 28, 0.06)", // subtle
        card: "0 8px 24px rgba(28, 28, 28, 0.08)",
        hover: "0 12px 32px rgba(28, 28, 28, 0.12)",
      },

      /* ===== FONT SIZES ===== */
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.4rem" }],      // 14px → small labels, readable
        sm: ["1rem", { lineHeight: "1.6rem" }],          // 16px → form labels/body text
        base: ["1.125rem", { lineHeight: "1.8rem" }],    // 18px → normal body text
        lg: ["1.375rem", { lineHeight: "2rem" }],        // 22px → larger body or subheadings
        xl: ["1.625rem", { lineHeight: "2.25rem" }],     // 26px → subheadings
        "2xl": ["2rem", { lineHeight: "2.5rem" }],       // 32px → section headings
        "3xl": ["2.5rem", { lineHeight: "3rem" }],       // 40px → large headings
        "4xl": ["3rem", { lineHeight: "3.5rem" }],       // 48px → hero headings
        "5xl": ["3.75rem", { lineHeight: "4rem" }],      // 60px → main hero or key titles
      },
    },
  },
  plugins: [],
};
