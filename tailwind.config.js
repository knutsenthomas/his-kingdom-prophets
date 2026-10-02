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
        // Core theme colors aligned with HKPC brand identity (#561291, #D7B978, #F6F4F8)
        primary: "#561291",
        "primary-container": "#561291",
        "on-primary": "#ffffff",
        "on-primary-container": "#E5DDED",
        
        secondary: "#561291",
        "secondary-container": "#f3e8ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#561291",
        
        gold: "#D7B978",
        "gold-dark": "#b8934e",
        "gold-light": "#f6dc94",
        "on-gold": "#561291",
        
        tertiary: "#561291",
        "tertiary-container": "#561291",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#f3e8ff",
        
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        
        background: "#F6F4F8",
        "on-background": "#271f30",
        
        surface: "#ffffff",
        "on-surface": "#271f30",
        "on-surface-variant": "#6d6575",
        "surface-dim": "#e2dce7",
        "surface-bright": "#ffffff",
        "surface-tint": "#561291",
        
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#faf8fc",
        "surface-container": "#F6F4F8",
        "surface-container-high": "#eeeaf2",
        "surface-container-highest": "#e2dce7",
        
        outline: "#6d6575",
        "outline-variant": "#e2dce7",
        
        "inverse-surface": "#271f30",
        "inverse-on-surface": "#F6F4F8",
        "inverse-primary": "#E5DDED",
        
        // Fixed variants
        "primary-fixed": "#f3e8ff",
        "primary-fixed-dim": "#d8b4fe",
        "on-primary-fixed": "#271f30",
        "on-primary-fixed-variant": "#561291",
        
        "secondary-fixed": "#f3e8ff",
        "secondary-fixed-dim": "#d8b4fe",
        "on-secondary-fixed": "#271f30",
        "on-secondary-fixed-variant": "#561291",
        
        "tertiary-fixed": "#f3e8ff",
        "tertiary-fixed-dim": "#d8b4fe",
        "on-tertiary-fixed": "#ffffff",
        "on-tertiary-fixed-variant": "#561291",
 
        // Warm accents
        "burnt-orange": "#D7B978",
        "burnt-orange-dark": "#b8934e"
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.6875rem", // 11px for buttons & inputs (8px grid / 10-14px)
        "2xl": "1rem",   // 16px for cards (16-24px)
        "3xl": "1.5rem", // 24px for major containers
        full: "9999px"
      },
      spacing: {
        unit: "8px",
        "element-gap": "16px",
        "container-padding": "32px",
        "sidebar-width": "280px",
        "table-cell-padding": "12px 16px"
      },
      fontFamily: {
        serif: ["Playfair Display", "Merriweather", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "Source Sans 3", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        "mono-sm": ["JetBrains Mono"],
        "headline-md": ["DM Sans", "sans-serif"],
        "headline-lg": ["DM Sans", "sans-serif"],
        "display-lg": ["DM Sans", "sans-serif"],
        "label-md": ["DM Sans", "sans-serif"],
        "headline-sm": ["DM Sans", "sans-serif"],
        "body-md": ["DM Sans", "sans-serif"],
        "body-lg": ["DM Sans", "sans-serif"],
        "body-sm": ["DM Sans", "sans-serif"]
      },
      fontSize: {
        "mono-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.035em", "fontWeight": "600"}],
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.08em", "fontWeight": "700"}],
        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "body-md": ["16px", {"lineHeight": "26px", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [],
}
