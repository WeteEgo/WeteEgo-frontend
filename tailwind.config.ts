import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          soft: "#1e3a5f",
          foreground: "#f0f4ff",
        },
        surface: {
          DEFAULT: "#0f1a2e",
          muted: "#152238",
          inverted: "#f0f4ff",
        },
        border: {
          subtle: "rgb(255 255 255 / <alpha-value>)",
        },
        success: "#00ff88",
        warning: "#ffb800",
        danger: "#DC2626",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 45px rgba(0,0,0,0.5)",
        focus: "0 0 0 1px rgba(37, 99, 235, 0.22), 0 0 0 4px rgba(37, 99, 235, 0.14)",
        "landing-glow":
          "0 0 0 1px rgba(0,212,255,0.12), 0 24px 80px rgba(0,0,0,0.45), 0 0 80px rgba(0,212,255,0.06)",
        "landing-lift": "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
