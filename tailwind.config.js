/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: {
      // ... existing theme extensions ...
    }
  },
  plugins: [require("tailwindcss-animate")],
}