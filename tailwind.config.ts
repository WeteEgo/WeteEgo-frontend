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
        sans: ["system-ui", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          soft: "#EFF4FF",
          foreground: "#0B1220",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F4F4F5",
          inverted: "#020617",
        },
        border: {
          subtle: "#E4E4E7",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
      boxShadow: {
        card: "0 18px 45px rgba(15, 23, 42, 0.08)",
        focus: "0 0 0 1px rgba(37, 99, 235, 0.22), 0 0 0 4px rgba(37, 99, 235, 0.14)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
