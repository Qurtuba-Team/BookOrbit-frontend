/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Critical for our Dark/Light toggle
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        library: {
          primary: '#183153', // Deep Oxford Blue
          accent: '#C7A35F', // Brass/Gold
          paper: '#F5F5F0', // Parchment off-white
          ink: '#1C1C1C', // Almost black text
        },
        dark: {
          bg: '#0D1117', // Rich dark background
          surface: '#161B22',
          border: '#30363D'
        }
      },
      fontFamily: {
        sans: ['Alexandria', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' }, // 100% for RTL
        }
      }
    },
  },
  plugins: [],
}

