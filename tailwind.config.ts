import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18222d",
        surface: "#f4f7fb",
        card: "#ffffff",
        line: "#d8e1ee",
        accent: "#2490ff",
        accentSoft: "#e7f3ff",
        success: "#1d9b74",
        warn: "#c98400",
        danger: "#d64c4c"
      },
      boxShadow: {
        card: "0 10px 30px rgba(24, 34, 45, 0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
};

export default config;
