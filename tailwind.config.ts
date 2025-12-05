import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Theme: Background surfaces (darkest to lightest)
        surface: {
          deepest: "var(--surface-deepest)",
          base: "var(--surface-base)",
          elevated: "var(--surface-elevated)",
          muted: "var(--surface-muted)",
        },
        // Theme: Primary brand (purple)
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          soft: "var(--brand-soft)",
          border: "var(--brand-border)",
          text: "var(--brand-text)",
          "text-light": "var(--brand-text-light)",
        },
        // Theme: Borders
        border: {
          DEFAULT: "var(--border-default)",
          muted: "var(--border-muted)",
          subtle: "var(--border-subtle)",
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
