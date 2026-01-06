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
        // Terminal/Hacker color palette
        terminal: {
          black: "#0a0a0a",
          dark: "#0d1117",
          bg: "#0a0e14",
          panel: "#141b22",
          border: "#1f2937",
          green: "#00ff41",
          "green-dim": "#00cc33",
          "green-bright": "#39ff14",
          cyan: "#00d4ff",
          "cyan-dim": "#00a8cc",
          blue: "#0088ff",
          purple: "#a855f7",
          amber: "#f59e0b",
          red: "#ff3333",
          white: "#e5e5e5",
          gray: "#6b7280",
        },
        // Pod status colors (cyber theme)
        pod: {
          running: "#00ff41",      // Matrix green
          pending: "#f59e0b",      // Amber warning
          crash: "#ff3333",        // Error red
          image: "#a855f7",        // Purple
        },
        // Cluster/Guardian colors
        cluster: {
          node: "#00d4ff",         // Cyan nodes
          pod: "#00ff41",          // Green pods
          service: "#0088ff",      // Blue services
          deployment: "#a855f7",   // Purple deployments
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        terminal: ["'VT323'", "'Share Tech Mono'", "monospace"],
        display: ["'Orbitron'", "'Rajdhani'", "sans-serif"],
      },
      boxShadow: {
        'terminal': '0 0 20px rgba(0, 255, 65, 0.15)',
        'terminal-lg': '0 0 40px rgba(0, 255, 65, 0.2)',
        'glow-green': '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3), 0 0 30px rgba(0, 255, 65, 0.1)',
        'glow-cyan': '0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-red': '0 0 10px rgba(255, 51, 51, 0.5), 0 0 20px rgba(255, 51, 51, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 65, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glitch': 'glitch 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 3.5s steps(40, end)',
        'blink': 'blink 1s step-end infinite',
        'float': 'float 6s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 20s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px rgba(0, 255, 65, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(0, 255, 65, 0.8), 0 0 30px rgba(0, 255, 65, 0.6)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#00ff41' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)',
        'circuit': 'url("/images/circuit-pattern.svg")',
        'hex-pattern': 'url("/images/hex-pattern.svg")',
      },
    },
  },
  plugins: [],
};

export default config;
