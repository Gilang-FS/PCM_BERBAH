/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        muhammadiyah: {
          light: '#4ade80', // hijau muda
          DEFAULT: '#15803d', // hijau utama (khas muhammadiyah)
          dark: '#14532d', // hijau gelap
        },
      }
    },
  },
  plugins: [],
}
