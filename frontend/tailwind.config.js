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
        "on-tertiary-fixed": "#0b1c30",
        "surface-container-low": "#f2f4f6",
        "on-error-container": "#93000a",
        "tertiary-fixed-dim": "#b7c8e1",
        "surface-variant": "#e0e3e5",
        "surface-dim": "#d8dadc",
        "secondary-container": "#a0f3d4",
        "surface-tint": "#1960a6",
        "primary-fixed-dim": "#a4c9ff",
        "on-primary-fixed": "#001c39",
        "outline": "#727782",
        "on-primary-fixed-variant": "#004883",
        "error": "#ba1a1a",
        "secondary-fixed": "#a0f3d4",
        "tertiary-container": "#4f5f75",
        "primary-container": "#185fa5",
        "on-tertiary": "#ffffff",
        "primary": "#038076",
        "on-background": "#191c1e",
        "on-primary": "#ffffff",
        "background": "#f7f9fb",
        "on-secondary-fixed-variant": "#00513e",
        "on-tertiary-fixed-variant": "#38485d",
        "on-secondary": "#ffffff",
        "on-surface-variant": "#424751",
        "tertiary-fixed": "#d3e4fe",
        "inverse-primary": "#a4c9ff",
        "on-surface": "#191c1e",
        "on-error": "#ffffff",
        "surface-container-high": "#e6e8ea",
        "surface-bright": "#f7f9fb",
        "error-container": "#ffdad6",
        "surface-container": "#eceef0",
        "on-primary-container": "#c1d9ff",
        "on-tertiary-container": "#c8d9f3",
        "tertiary": "#38475c",
        "surface-container-highest": "#e0e3e5",
        "inverse-surface": "#2d3133",
        "primary-fixed": "#d4e3ff",
        "secondary-fixed-dim": "#84d6b9",
        "surface-container-lowest": "#ffffff",
        "on-secondary-container": "#167159",
        "secondary": "#086b53",
        "inverse-on-surface": "#eff1f3",
        "outline-variant": "#c2c6d2",
        "surface": "#f7f9fb",
        "on-secondary-fixed": "#002117",
        // Custom contrast overrides for Slate
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          150: "#e2e8f0",
          200: "#e2e8f0",
          250: "#cbd5e1",
          300: "#cbd5e1",
          350: "#94a3b8",
          400: "#475569", // Darker slate (originally #94a3b8)
          500: "#334155", // Darker slate body (originally #64748b)
          600: "#1e293b", // Darker title (originally #475569)
          700: "#0f172a", // Darker text (originally #334155)
        },
        // Custom contrast overrides for Gray
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          350: "#9ca3af",
          400: "#4b5563", // Darker gray (originally #9ca3af)
          500: "#374151", // Darker body (originally #6b7280)
          600: "#1f2937", // Darker text (originally #4b5563)
          700: "#111827", // Darker title (originally #374151)
        },
        // Custom contrast overrides for Zinc
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          350: "#a1a1aa",
          400: "#52525b", // Darker zinc (originally #a1a1aa)
          500: "#3f3f46", // Darker body (originally #71717a)
          600: "#27272a", // Darker text (originally #52525b)
          700: "#18181b", // Darker title (originally #3f3f46)
        },
        // Custom contrast overrides for Neutral
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          350: "#a3a3a3",
          400: "#525252", // Darker neutral (originally #a3a3a3)
          500: "#404040", // Darker body (originally #737373)
          600: "#262626", // Darker text (originally #525252)
          700: "#171717", // Darker title (originally #404040)
        }
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "max-width": "1440px",
        "base": "4px",
        "margin-desktop": "48px",
        "xxl": "64px",
        "lg": "24px",
        "margin-mobile": "20px",
        "xl": "40px",
        "gutter": "20px",
        "md": "20px",
        "sm": "12px",
        "xs": "6px"
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        "headline-lg": ["'IBM Plex Sans'", "sans-serif"],
        "label-sm": ["'IBM Plex Sans'", "sans-serif"],
        "headline-md": ["'IBM Plex Sans'", "sans-serif"],
        "headline-sm": ["'IBM Plex Sans'", "sans-serif"],
        "label-md": ["'IBM Plex Sans'", "sans-serif"],
        "body-lg": ["'IBM Plex Sans'", "sans-serif"],
        "body-sm": ["'IBM Plex Sans'", "sans-serif"],
        "body-md": ["'IBM Plex Sans'", "sans-serif"],
        "headline-lg-mobile": ["'IBM Plex Sans'", "sans-serif"],
        "poppins": ["'IBM Plex Sans'", "sans-serif"]
      },
      fontSize: {
        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "label-md": ["14px", { "lineHeight": "1", "fontWeight": "500" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "600" }]
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.35", transform: "scale(1.08)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-30px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 3.5s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-left": "slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
