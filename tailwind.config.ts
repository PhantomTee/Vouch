import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080B14",
        panel: "#101624",
        line: "#25304A",
        brand: { blue: "#4F8CFF", purple: "#8B5CF6", green: "#39D98A", amber: "#F5B84B", red: "#FF5C7A" }
      },
      boxShadow: { glow: "0 0 40px rgba(79,140,255,.25)" }
    }
  },
  plugins: []
};
export default config;
