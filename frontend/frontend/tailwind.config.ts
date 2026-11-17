import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EAF3FF",
          100: "#D4E6FC",
          200: "#A8CCF5",
          300: "#7CA6E2",
          400: "#5A95E0",
          500: "#2E70BC",
          600: "#255C9C",
          700: "#1D4B80",
          800: "#153A68",
          900: "#102B52",
        },
        slate: {
          50: "#F2F7FC",
          100: "#E5EEF7",
          200: "#C2D4EA",
          300: "#AEC6DF",
          400: "#97AEC7",
          500: "#758EA9",
          600: "#607C99",
          700: "#395978",
          800: "#213E5E",
          900: "#132C49",
          950: "#091B30",
        },
        emerald: {
          50: "#ECF8F3", 100: "#D6F0E3", 200: "#ACE0C9",
          300: "#7DCCA9", 400: "#60BF99", 500: "#49B68D",
          600: "#318B6B", 700: "#266D54", 800: "#205742", 900: "#193D30",
        },
        amber: {
          50: "#FBF5E9", 100: "#F5EAD2", 200: "#EAD4A5",
          300: "#E0BC7B", 400: "#D9B26C", 500: "#D4AC69",
          600: "#A97A3A", 700: "#825B2B", 800: "#664823", 900: "#4A361C",
        },
        red: {
          50: "#FCF0F2", 100: "#F7DEE2", 200: "#EEC2C9",
          300: "#E5A4AE", 400: "#DD8A96", 500: "#D47682",
          600: "#B85260", 700: "#983E4C", 800: "#78343E", 900: "#5D2A31",
        },
        surface: {
          light: "#FFFFFF",
          muted: "#E5EEF7",
          dark: "#07192C",
          darker: "#0C2039",
          elevated: "#132844",
        },
        border: {
          light: "#C2D4EA",
          dark: "#395978",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(46, 112, 188, 0.22)",
        card: "0 1px 2px rgba(7, 25, 44, 0.025)",
      },
      backgroundImage: {
        "grid-slate":
          "linear-gradient(to right, rgb(46 112 188 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(46 112 188 / 0.06) 1px, transparent 1px)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
