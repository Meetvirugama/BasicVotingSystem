/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable manual dark mode switching via a class
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366F1', // Indigo
          light: '#818CF8',
          dark: '#4F46E5',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        success: '#10B981',   // Emerald
        warning: '#F59E0B',   // Amber
        danger: '#EF4444',    // Red
        dark: {
          DEFAULT: '#0F172A', // Slate 900
          900: '#0F172A',     // Slate 900
          800: '#1E293B',     // Slate 800
          700: '#334155',     // Slate 700
        },
        light: {
          DEFAULT: '#F8FAFC', // Slate 50
          100: '#F1F5F9',     // Slate 100
          200: '#E2E8F0',     // Slate 200
        }
      }
    },
  },
  plugins: [],
}
