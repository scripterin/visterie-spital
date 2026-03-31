import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        vault: {
          bg: "#080B10",
          surface: "#0D1117",
          card: "#111820",
          border: "#1C2333",
          gold: "#F0B429",
          goldLight: "#FFD166",
          green: "#00E5A0",
          red: "#FF4D6D",
          text: "#E6EDF3",
          muted: "#8B949E",
        },
      },
      keyframes: {
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-3px, 3px)", filter: "hue-rotate(90deg)" },
          "40%": { transform: "translate(3px, -3px)", filter: "hue-rotate(180deg)" },
          "60%": { transform: "translate(-2px, 2px)" },
          "80%": { transform: "translate(2px, -1px)", filter: "hue-rotate(45deg)" },
          "100%": { transform: "translate(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse2: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        glitch: "glitch 0.4s infinite",
        shimmer: "shimmer 2s linear infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.4s ease-out",
        pulse2: "pulse2 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
