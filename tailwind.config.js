/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Core theme colors from design system
        primary: "#00324b",
        "primary-container": "#1b4965",
        "on-primary": "#ffffff",
        "on-primary-container": "#8eb8d8",
        
        secondary: "#46617b",
        "secondary-container": "#c4e0fe",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#48637d",
        
        tertiary: "#1d3141",
        "tertiary-container": "#344759",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#a1b5ca",
        
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        
        background: "#f6fafe",
        "on-background": "#171c1f",
        
        surface: "#f6fafe",
        "on-surface": "#171c1f",
        "on-surface-variant": "#41474d",
        "surface-dim": "#d6dade",
        "surface-bright": "#f6fafe",
        "surface-tint": "#386380",
        
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f4f8",
        "surface-container": "#eaeef2",
        "surface-container-high": "#e4e9ed",
        "surface-container-highest": "#dfe3e7",
        
        outline: "#72787e",
        "outline-variant": "#c1c7ce",
        
        "inverse-surface": "#2c3134",
        "inverse-on-surface": "#edf1f5",
        "inverse-primary": "#a1cced",
        
        // Fixed variants
        "primary-fixed": "#c9e6ff",
        "primary-fixed-dim": "#a1cced",
        "on-primary-fixed": "#001e2f",
        "on-primary-fixed-variant": "#1d4b67",
        
        "secondary-fixed": "#cee5ff",
        "secondary-fixed-dim": "#aec9e7",
        "on-secondary-fixed": "#001d32",
        "on-secondary-fixed-variant": "#2e4962",
        
        "tertiary-fixed": "#d0e5fb",
        "tertiary-fixed-dim": "#b5c9de",
        "on-tertiary-fixed": "#081d2d",
        "on-tertiary-fixed-variant": "#36495a"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
      },
      spacing: {
        unit: "8px",
        "element-gap": "16px",
        "container-padding": "32px",
        "sidebar-width": "280px",
        "table-cell-padding": "12px 16px"
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "serif"],
        sans: ["Source Sans 3", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
