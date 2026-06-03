import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-anton)", "Impact", "sans-serif"],
        mono: ["var(--font-space-mono)", "Courier New", "monospace"],
      },
      colors: {
        bg: "#87CEEB",
        ink: "#0A0A0A",
        paper: "#FFFFFF",
        gold: "#F5C842",
        coral: "#FF6B5B",
        panel: "#FFFFFF",
        line: "#0A0A0A",
        brand: { blue: "#4F8CFF", purple: "#8B5CF6", green: "#39D98A", amber: "#F5B84B", red: "#FF5C7A" }
      },
      boxShadow: {
        neo: "4px 4px 0px #0A0A0A",
        "neo-lg": "6px 6px 0px #0A0A0A",
        "neo-sm": "2px 2px 0px #0A0A0A",
      }
    }
  },
  plugins: []
};
export default config;
