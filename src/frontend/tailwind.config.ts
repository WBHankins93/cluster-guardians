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
        // Medieval fantasy tech palette
        k8s: {
          blue: "#6B46C1",        // Mystical purple-blue
          "blue-dark": "#4C1D95", // Deep royal purple
          "blue-light": "#8B5CF6", // Bright magical purple
        },
        // Fantasy-themed pod status colors
        pod: {
          running: "#10B981",     // Emerald green (healthy magic)
          pending: "#F59E0B",     // Amber gold (waiting)
          crash: "#DC2626",      // Crimson red (corruption)
          image: "#9333EA",      // Royal purple (mystical)
        },
        // Medieval terminal styling
        terminal: {
          bg: "#1C1917",         // Dark stone
          fg: "#D4AF37",         // Gold text (ancient script)
          accent: "#8B5CF6",     // Magical purple
        },
        // Fantasy UI colors
        fantasy: {
          gold: "#D4AF37",       // Ancient gold
          "gold-light": "#F4D03F",
          bronze: "#CD7F32",     // Aged bronze
          stone: "#78716C",      // Stone gray
          "stone-dark": "#3C3633",
          parchment: "#F5E6D3",  // Parchment beige
          "parchment-dark": "#E8D5B7",
          rune: "#6B46C1",       // Rune blue-purple
          crystal: "#8B5CF6",    // Crystal purple
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        game: ["var(--font-game)", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
        fantasy: ["Cinzel", "Georgia", "serif"],
      },
      boxShadow: {
        'medieval': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'medieval-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
