/** @type {import('tailwindcss').Config} */
export default {
  // GANTI 'class' MENJADI 'selector' JIKA TAILWIND VERSI TERBARU
  darkMode: 'selector',

  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // PASTIKAN PATH INI SESUAI DENGAN LOKASI FILE .vue KAMU
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
