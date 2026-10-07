import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          tertiary: "var(--accent-tertiary)",
        },
        severity: {
          critical: "var(--severity-critical)",
          high: "var(--severity-high)",
          medium: "var(--severity-medium)",
          low: "var(--severity-low)",
          info: "var(--severity-info)",
        },
        text: {
          primary: "var(--text-primary)",
          muted: "var(--text-muted)",
        },
        border: {
          glow: "var(--border-glow)",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Space Mono", "monospace"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px var(--border-glow)",
        "glow-cyan": "0 0 20px rgba(0, 217, 255, 0.35)",
        "glow-green": "0 0 20px rgba(0, 255, 156, 0.35)",
        "glow-magenta": "0 0 20px rgba(255, 43, 214, 0.35)",
        "glow-critical": "0 0 20px rgba(255, 46, 99, 0.4)",
      },
      animation: {
        "radar-sweep": "radar 3s linear infinite",
        scanline: "scanline 8s linear infinite",
        glitch: "glitch 1s infinite alternate",
        pulseFast: "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-1px, -1px)" },
          "60%": { transform: "translate(2px, 1px)" },
          "80%": { transform: "translate(1px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
