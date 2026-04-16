import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#22C55E",
          dark: "#16A34A",
          glow: "#22C55E33",
        },
        bg: "#0A0A0A",
        surface: "#111111",
        "surface-2": "#1A1A1A",
        border: "#2A2A2A",
        text: "#F5F5F5",
        muted: "#888888",
        danger: "#EF4444",
        warning: "#F59E0B",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["Barlow", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        grow: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
