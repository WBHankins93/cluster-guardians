import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./worlds/**/*.{js,ts,jsx,tsx,mdx}",
    "./terminal/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kubernetes-themed color palette
        k8s: {
          blue: "#326CE5",
          "blue-dark": "#1E4B9E",
          "blue-light": "#5B8DEF",
        },
        // Game-specific colors
        pod: {
          running: "#10B981",    // green
          pending: "#F59E0B",    // yellow
          crash: "#EF4444",      // red
          image: "#8B5CF6",      // purple
        },
        terminal: {
          bg: "#1A1B26",
          fg: "#A9B1D6",
          accent: "#7AA2F7",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        game: ["var(--font-game)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
