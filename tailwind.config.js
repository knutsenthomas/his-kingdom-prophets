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
        // Core theme colors from design system (Majestic Royal Purple theme)
        primary: "#3c096c",
        "primary-container": "#561291",
        "on-primary": "#ffffff",
        "on-primary-container": "#e0aaff",
        
        secondary: "#7b2cbf",
        "secondary-container": "#f3e8ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#561291",
        
        tertiary: "#240046",
        "tertiary-container": "#3c096c",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#f3e8ff",
        
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        
        background: "#faf7fc",
        "on-background": "#240046",
        
        surface: "#faf7fc",
        "on-surface": "#240046",
        "on-surface-variant": "#5a4d66",
        "surface-dim": "#dec2ef",
        "surface-bright": "#faf7fc",
        "surface-tint": "#561291",
        
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5eefb",
        "surface-container": "#eedff7",
        "surface-container-high": "#e6d1f3",
        "surface-container-highest": "#dec2ef",
        
        outline: "#7e6d8a",
        "outline-variant": "#dec2ef",
        
        "inverse-surface": "#32273c",
        "inverse-on-surface": "#f5eefb",
        "inverse-primary": "#d8b4fe",
        
        // Fixed variants
        "primary-fixed": "#f3e8ff",
        "primary-fixed-dim": "#d8b4fe",
        "on-primary-fixed": "#240046",
        "on-primary-fixed-variant": "#561291",
        
        "secondary-fixed": "#f3e8ff",
        "secondary-fixed-dim": "#d8b4fe",
        "on-secondary-fixed": "#240046",
        "on-secondary-fixed-variant": "#7b2cbf",
        
        "tertiary-fixed": "#f3e8ff",
        "tertiary-fixed-dim": "#d8b4fe",
        "on-tertiary-fixed": "#ffffff",
        "on-tertiary-fixed-variant": "#3c096c",
 
        // Burnt orange gradient colors for premium accents & visual editor
        "burnt-orange": "#d17d39",
        "burnt-orange-dark": "#bd4f2a"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
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
        serif: ["Merriweather", "Georgia", "serif"],
        sans: ["Merriweather", "Source Sans 3", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        "mono-sm": ["JetBrains Mono"],
        "headline-md": ["Merriweather"],
        "headline-lg": ["Merriweather"],
        "display-lg": ["Merriweather"],
        "label-md": ["Source Sans 3"],
        "headline-sm": ["Merriweather"],
        "body-md": ["Source Sans 3"],
        "body-lg": ["Source Sans 3"],
        "body-sm": ["Source Sans 3"]
      },
      fontSize: {
        "mono-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
        "display-lg": ["48px", {"lineHeight": "60px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "700"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [],
}
