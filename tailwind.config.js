/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f14",
        foreground: "#e6f0ff",
        card: "#1b2432",
        muted: "#a9b6cb",
        border: "#2a3547",
        accent: {
          DEFAULT: "#5B8DEF",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#e6f0ff",
          foreground: "#0b0f14",
        },
        secondary: {
          DEFAULT: "#1b2432",
          foreground: "#e6f0ff",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["10px", "14px"],
        sm: ["12px", "16px"],
        base: ["14px", "20px"],
        lg: ["16px", "24px"],
        xl: ["20px", "28px"],
        "2xl": ["24px", "32px"],
        "3xl": ["28px", "36px"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
