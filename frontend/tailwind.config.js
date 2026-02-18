/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#D97706",
        primarySoft: "#fff4e7",
        primaryDark: "#B45309",
        background: "#ffffff",
        backgroundDark: "#1F1F1F",
        textPrimary: "#1C1C1C",
        textSecondary: "#4B4B4B",
        textLight: "#FFFFFF",
        border: "#E5E0D9",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },

      /* ================= TYPOGRAPHY WITH MOBILE (SM) TOKENS ================= */
      fontSize: {
        // Desktop Sizes
        'h1': ["60px", { lineHeight: "60px", fontWeight: "700" }], 
        'h2': ["45px", { lineHeight: "40px", fontWeight: "600" }], 
        'h3': ["23px", { lineHeight: "40px", fontWeight: "600" }], 
        'body': ["18px", { lineHeight: "30px", fontWeight: "400" }], 

        // Mobile (sm) specific sizes for better responsiveness [cite: 2026-02-06]
        'h1-sm': ["36px", { lineHeight: "42px", fontWeight: "400" }],
        'h2-sm': ["28px", { lineHeight: "34px", fontWeight: "400" }],
        'h3-sm': ["22px", { lineHeight: "28px", fontWeight: "400" }],
        'body-sm': ["16px", { lineHeight: "24px", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};