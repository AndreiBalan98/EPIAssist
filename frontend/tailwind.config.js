/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#3b82f6", // blue-500
          600: "#2563eb", // blue-600
        },
      },
    },
  },
  plugins: [],
}
