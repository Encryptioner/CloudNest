import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "#6366f1",
        cn: {
          bg: "var(--cn-bg)",
          s1: "var(--cn-s1)",
          s2: "var(--cn-s2)",
          border: "var(--cn-border)",
          hover: "var(--cn-hover)",
          text: "var(--cn-text)",
          text2: "var(--cn-text2)",
          text3: "var(--cn-text3)",
          sidebar: "var(--cn-sidebar)",
        },
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out 1s infinite",
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-up-d1": "fadeUp 0.6s 0.1s ease forwards both",
        "fade-up-d2": "fadeUp 0.6s 0.2s ease forwards both",
        "fade-up-d3": "fadeUp 0.6s 0.3s ease forwards both",
        "fade-up-d4": "fadeUp 0.6s 0.4s ease forwards both",
        "fade-in": "fadeIn 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
