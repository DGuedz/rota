import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#fbf9f2",
          container: {
            low: "#f6f4ec",
            DEFAULT: "#f0eee7",
            high: "#e8e6df",
            highest: "#e1dfd8",
          },
        },
        primary: {
          DEFAULT: "#705d00",
          container: "#ffdf33",
        },
        on: {
          surface: "#0a0a0a",
          primary: "#ffffff",
        },
        outline: {
          DEFAULT: "#7e7760",
          variant: "#d0c6ac",
        },
        signal: {
          gold: "#E8C300",
          amber: "#CFAF2D",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        'signal-glow': '0 0 20px rgba(232, 195, 0, 0.3)',
        'ambient': '0px 12px 32px rgba(10, 10, 10, 0.04)',
      },
    },
  },
  plugins: [],
};
export default config;
