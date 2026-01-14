import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import typography from "@tailwindcss/typography";

export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'app-title': ['1.5rem', { lineHeight: '2rem', fontWeight: '500' }],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            maxWidth: 'none',
            strong: { color: '#fff', fontWeight: '600' },
            h1: { color: '#fff' },
            h2: { color: '#fff' },
            h3: { color: '#fff' },
            h4: { color: '#fff' },
            p: { color: '#fff', marginTop: '0.5em', marginBottom: '0.5em' },
            li: { color: '#fff', marginTop: '0.25em', marginBottom: '0.25em' },
            'ul > li': {
              paddingLeft: '1.5em',
              position: 'relative',
              '&::before': { content: '"•"', position: 'absolute', left: '0.25em', color: '#fff' },
            },
            'ol > li': {
              paddingLeft: '1.5em',
              position: 'relative',
              '&::before': { color: '#fff' },
            },
            hr: { borderColor: '#374151', marginTop: '2em', marginBottom: '2em' },
            pre: { backgroundColor: '#1f2937', color: '#fff', padding: '1em', borderRadius: '0.375rem' },
            code: { color: '#fff', backgroundColor: '#374151', padding: '0.25em 0.5em', borderRadius: '0.25rem', fontSize: '0.875em' },
          },
        },
      },
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
        // Theme: Secondary/action (teal)
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          soft: "var(--secondary-soft)",
          border: "var(--secondary-border)",
        },
        // Theme: Borders
        border: {
          DEFAULT: "var(--border-default)",
          muted: "var(--border-muted)",
          subtle: "var(--border-subtle)",
        },
        // Theme: Miscellaneous
        tooltip: "var(--tooltip-bg)",
      },
      // Safe area spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
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
  plugins: [
    typography,
    // Safe area utilities plugin
    plugin(function({ addUtilities }) {
      addUtilities({
        // Padding utilities
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top, 0px)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left, 0px)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right, 0px)' },
        '.px-safe': { 
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        },
        '.py-safe': {
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        '.p-safe': {
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
        },
        // Margin utilities
        '.mt-safe': { marginTop: 'env(safe-area-inset-top, 0px)' },
        '.mb-safe': { marginBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.ml-safe': { marginLeft: 'env(safe-area-inset-left, 0px)' },
        '.mr-safe': { marginRight: 'env(safe-area-inset-right, 0px)' },
        // Min-height with safe area
        '.min-h-screen-safe': { 
          minHeight: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))' 
        },
        // Bottom positioning with safe area (for fixed elements)
        '.bottom-safe': { bottom: 'env(safe-area-inset-bottom, 0px)' },
        '.top-safe': { top: 'env(safe-area-inset-top, 0px)' },
      });
    }),
  ],
} satisfies Config;
