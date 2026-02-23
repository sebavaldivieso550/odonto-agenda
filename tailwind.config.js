/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'med-blue': '#1a73e8', // Azul profesional
        'med-bg': '#f8f9fa',   // Fondo gris casi blanco
        'med-card': '#ffffff'  // Blanco puro para las celdas
      }
    },
  },
  plugins: [],
}