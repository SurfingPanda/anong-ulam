import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Nunito",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "Baloo 2",
          "ui-rounded",
          "Trebuchet MS",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        gold: "hsl(var(--gold))",
        leaf: {
          DEFAULT: "hsl(var(--leaf))",
          foreground: "hsl(var(--leaf-foreground))",
          bright: "hsl(var(--leaf-bright))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        card: "0 10px 30px -12px hsl(9 40% 30% / 0.22), 0 2px 6px -2px hsl(9 40% 30% / 0.12)",
        glow: "0 18px 42px -14px hsl(9 62% 45% / 0.42), 0 0 0 1px hsl(35 78% 66% / 0.35)",
        sticker: "3px 4px 0 0 hsl(16 42% 15% / 0.85)",
        pop: "0 6px 0 -1px hsl(9 61% 34%)",
        "pop-sm": "0 4px 0 -1px hsl(9 61% 34%)",
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
        steam: {
          "0%": { opacity: "0", transform: "translateY(4px) scaleX(1)" },
          "35%": { opacity: "0.7" },
          "100%": {
            opacity: "0",
            transform: "translateY(-14px) scaleX(1.5)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tw-rotate, 0))" },
          "50%": {
            transform: "translateY(-10px) rotate(var(--tw-rotate, 0))",
          },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        steam: "steam 2.4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out",
        "pop-in": "pop-in 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
