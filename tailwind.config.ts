import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        panel: "#0b1020",
        line: "#1e293b",
        neon: "#7CFF6B",
        ember: "#FF8A3D",
      },
      boxShadow: {
        glow: "0 0 32px rgba(124, 255, 107, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
