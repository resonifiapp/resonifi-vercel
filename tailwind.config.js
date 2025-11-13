const plugin = require("tailwindcss/plugin");

const animatePlugin = plugin(({ addUtilities }) => {
  addUtilities({
    ".animate-in": {
      "--tw-enter-opacity": "1",
      "--tw-enter-scale": "1",
      "--tw-enter-rotate": "0deg",
      "--tw-enter-translate-x": "0",
      "--tw-enter-translate-y": "0",
      animation:
        "enter var(--tw-enter-duration, 150ms) var(--tw-enter-easing, cubic-bezier(0.16, 1, 0.3, 1)) var(--tw-enter-delay, 0ms)",
      animationFillMode: "both"
    },
    ".animate-out": {
      "--tw-exit-opacity": "1",
      "--tw-exit-scale": "1",
      "--tw-exit-rotate": "0deg",
      "--tw-exit-translate-x": "0",
      "--tw-exit-translate-y": "0",
      animation:
        "exit var(--tw-exit-duration, 150ms) var(--tw-exit-easing, cubic-bezier(0.16, 1, 0.3, 1)) var(--tw-exit-delay, 0ms)",
      animationFillMode: "both"
    },
    ".fade-in": { "--tw-enter-opacity": "0" },
    ".fade-in-0": { "--tw-enter-opacity": "0" },
    ".fade-out": { "--tw-exit-opacity": "0" },
    ".fade-out-0": { "--tw-exit-opacity": "0" },
    ".fade-out-80": { "--tw-exit-opacity": "0.8" },
    ".zoom-in-90": { "--tw-enter-scale": ".9" },
    ".zoom-in-95": { "--tw-enter-scale": ".95" },
    ".zoom-out-95": { "--tw-exit-scale": ".95" },
    ".slide-in-from-top": { "--tw-enter-translate-y": "-100%" },
    ".slide-in-from-top-2": { "--tw-enter-translate-y": "-0.5rem" },
    ".slide-in-from-top-full": { "--tw-enter-translate-y": "-100%" },
    ".slide-in-from-top-\\[48%\\]": { "--tw-enter-translate-y": "-48%" },
    ".slide-in-from-bottom": { "--tw-enter-translate-y": "100%" },
    ".slide-in-from-bottom-2": { "--tw-enter-translate-y": "0.5rem" },
    ".slide-in-from-bottom-full": { "--tw-enter-translate-y": "100%" },
    ".slide-in-from-right": { "--tw-enter-translate-x": "100%" },
    ".slide-in-from-right-2": { "--tw-enter-translate-x": "0.5rem" },
    ".slide-in-from-right-52": { "--tw-enter-translate-x": "13rem" },
    ".slide-in-from-left": { "--tw-enter-translate-x": "-100%" },
    ".slide-in-from-left-2": { "--tw-enter-translate-x": "-0.5rem" },
    ".slide-in-from-left-52": { "--tw-enter-translate-x": "-13rem" },
    ".slide-in-from-left-1\\/2": { "--tw-enter-translate-x": "-50%" },
    ".slide-out-to-top": { "--tw-exit-translate-y": "-100%" },
    ".slide-out-to-top-\\[48%\\]": { "--tw-exit-translate-y": "-48%" },
    ".slide-out-to-bottom": { "--tw-exit-translate-y": "100%" },
    ".slide-out-to-right": { "--tw-exit-translate-x": "100%" },
    ".slide-out-to-right-full": { "--tw-exit-translate-x": "100%" },
    ".slide-out-to-right-52": { "--tw-exit-translate-x": "13rem" },
    ".slide-out-to-left": { "--tw-exit-translate-x": "-100%" },
    ".slide-out-to-left-52": { "--tw-exit-translate-x": "-13rem" },
    ".slide-out-to-left-1\\/2": { "--tw-exit-translate-x": "-50%" }
  });
});

module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif"
        ]
      },
      keyframes: {
        enter: {
          from: {
            opacity: "var(--tw-enter-opacity, 1)",
            transform:
              "translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale(var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))"
          },
          to: {
            opacity: "1",
            transform: "translate3d(0, 0, 0) scale(1) rotate(0)"
          }
        },
        exit: {
          from: {
            opacity: "1",
            transform: "translate3d(0, 0, 0) scale(1) rotate(0)"
          },
          to: {
            opacity: "var(--tw-exit-opacity, 0)",
            transform:
              "translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale(var(--tw-exit-scale, 0.95)) rotate(var(--tw-exit-rotate, 0))"
          }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "caret-blink": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1s steps(2, start) infinite",
        enter: "enter 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        exit: "exit 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: [animatePlugin]
};
