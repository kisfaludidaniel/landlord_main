/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(220 13% 91%)", // light grey border
        input: "#ffffff", // pure white
        ring: "#2563eb", // brand blue
        background: "#fafafa", // warm off-white
        foreground: "hsl(222 84% 5%)", // near-black
        primary: {
          DEFAULT: "#2563eb", // brand blue
          foreground: "#ffffff", // white
        },
        secondary: {
          DEFAULT: "hsl(220 14% 96%)", // light grey
          foreground: "hsl(220 9% 46%)", // dark grey
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)", // red
          foreground: "#ffffff", // white
        },
        muted: {
          DEFAULT: "hsl(220 14% 96%)", // light grey
          foreground: "hsl(220 9% 46%)", // dark grey
        },
        accent: {
          DEFAULT: "#1e293b", // dark grey/charcoal
          foreground: "#ffffff", // white
        },
        popover: {
          DEFAULT: "#ffffff", // pure white
          foreground: "hsl(222 84% 5%)", // near-black
        },
        card: {
          DEFAULT: "#ffffff", // pure white
          foreground: "hsl(222 84% 5%)", // near-black
        },
        success: {
          DEFAULT: "#16a34a", // green
          foreground: "#ffffff", // white
        },
        warning: {
          DEFAULT: "#f59e0b", // amber
          foreground: "hsl(222 84% 5%)", // near-black
        },
        error: {
          DEFAULT: "hsl(0 84% 60%)", // red
          foreground: "#ffffff", // white
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'elevated': '0 10px 25px rgba(0, 0, 0, 0.15)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}