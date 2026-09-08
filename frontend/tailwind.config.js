export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'Arial', 'sans-serif'],
        publicSans: ['Lato', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          700: '#15803D',
          800: '#166534',
          900: '#1B5E20', // Muhammadiyah Green
          950: '#145218'  // Muhammadiyah Darker
        },
        // Additional Muhammadiyah-themed colors
        muhammadiyah: {
          green: {
            50: '#e8f5e9',
            100: '#c8e6c9',
            200: '#a5d6a7',
            300: '#81c784',
            400: '#66bb6a',
            500: '#4caf50',
            600: '#43a047',
            700: '#388e3c',
            800: '#2e7d32',
            900: '#1B5E20', // Primary green
          },
          darkGreen: '#174f1b', // Used in headers
          darkerGreen: '#102f16', // Used in overlays
          brown: {
            50: '#f9f4e8',
            100: '#f0e7d4',
            200: '#e3d0b8',
            300: '#d4b99a',
            400: '#c09f7b',
            500: '#aa855f',
            600: '#926d4a',
            700: '#7a573a',
            800: '#62432b',
            900: '#4a321e',
          },
          beige: {
            50: '#fdfdfd',
            100: '#fbf9f7',
            200: '#f8f6f2',
            300: '#f4f0ea',
            400: '#edeae1',
            500: '#e4e1d8',
            600: '#d8d4c9',
            700: '#c9c5ba',
            800: '#b9b4a9',
            900: '#a9a39a',
          }
        },
        background: '#f5f6fa'
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(0,0,0,0.05)',
        'glow': '0 10px 25px -5px rgba(27, 94, 32, 0.25)',
        'card': '0 6px 16px -4px rgba(0,0,0,0.08)'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      letterSpacing: {
        tightest: '-.03em',
      }
    },
  },
  plugins: [],
}
