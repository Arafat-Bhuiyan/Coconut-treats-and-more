/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/pages/Home/sections/Order/Order.jsx"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4A6741",
        secondary: "#8DA47E",
        "milk-white": "#FDFCF8",
        "pure-coconut": "#FFFFFF",
        husk: "#2C332A",
        accent: "#97BC62",
        "accent-dark": "#5A7336",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
