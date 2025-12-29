// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: "class", // Enables dark mode via class (perfect for your toggle)
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",    // blue-500 – vibrant main brand
        "primary-dark": "#1d4ed8", // blue-700 – hover/depth
        accent: "#7c3aed",     // violet-600 – secondary accents
        success: "#10b981",    // emerald-500
        warning: "#f59e0b",    // amber-500
        danger: "#ef4444",     // red-500
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-lg": "0 20px 40px 0 rgba(31, 38, 135, 0.2)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
  layers: {
    components: [
      {
        ".glass-card": {
          "@apply bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-glass": {},
        },
        ".glass-card-hover": {
          "@apply hover:shadow-glass-lg hover:-translate-y-2 transition-all duration-500": {},
        },
        ".btn-primary": {
          "@apply bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-5 px-10 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-60": {},
        },
        ".btn-accent": {
          "@apply bg-gradient-to-r from-accent to-purple-700 text-white font-bold py-5 px-10 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300": {},
        },
        ".privacy-badge": {
          "@apply inline-flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-8 py-5 rounded-full font-bold text-lg shadow-md": {},
        },
        ".text-gradient": {
          "@apply bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent": {},
        },
      },
    ],
  },
};
