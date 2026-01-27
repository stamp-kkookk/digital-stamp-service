/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kkookk: {
          // Primary - Orange Scale
          orange: {
            50: 'var(--color-kkookk-orange-50)',
            100: 'var(--color-kkookk-orange-100)',
            200: 'var(--color-kkookk-orange-200)',
            300: 'var(--color-kkookk-orange-300)',
            400: 'var(--color-kkookk-orange-400)',
            500: 'var(--color-kkookk-orange-500)',
            600: 'var(--color-kkookk-orange-600)',
            700: 'var(--color-kkookk-orange-700)',
            800: 'var(--color-kkookk-orange-800)',
            900: 'var(--color-kkookk-orange-900)',
            DEFAULT: 'var(--color-kkookk-orange-500)',
          },
          // Secondary - Indigo Scale (Owner Persona)
          indigo: {
            50: 'var(--color-kkookk-indigo-50)',
            100: 'var(--color-kkookk-indigo-100)',
            200: 'var(--color-kkookk-indigo-200)',
            500: 'var(--color-kkookk-indigo-500)',
            600: 'var(--color-kkookk-indigo-600)',
            700: 'var(--color-kkookk-indigo-700)',
            DEFAULT: 'var(--color-kkookk-indigo)',
          },
          // Neutral - Navy Scale
          navy: {
            50: 'var(--color-kkookk-navy-50)',
            100: 'var(--color-kkookk-navy-100)',
            900: 'var(--color-kkookk-navy-900)',
            DEFAULT: 'var(--color-kkookk-navy)',
          },
          // Neutral - Steel Scale
          steel: {
            100: 'var(--color-kkookk-steel-100)',
            200: 'var(--color-kkookk-steel-200)',
            300: 'var(--color-kkookk-steel-300)',
            400: 'var(--color-kkookk-steel-400)',
            DEFAULT: 'var(--color-kkookk-steel)',
          },
          // Status Colors
          green: {
            50: 'var(--color-kkookk-green-50)',
            500: 'var(--color-kkookk-green-500)',
            DEFAULT: 'var(--color-kkookk-green)',
          },
          red: {
            50: 'var(--color-kkookk-red-50)',
            500: 'var(--color-kkookk-red-500)',
            DEFAULT: 'var(--color-kkookk-red)',
          },
          amber: {
            50: 'var(--color-kkookk-amber-50)',
            500: 'var(--color-kkookk-amber-500)',
            DEFAULT: 'var(--color-kkookk-amber)',
          },
          // Customer Persona
          sand: 'var(--color-kkookk-sand)',
          yellow: 'var(--color-kkookk-yellow)',
          // Global
          paper: 'var(--color-kkookk-paper)',
        },
      },
      borderRadius: {
        'kkookk-sm': 'var(--radius-sm)',
        'kkookk-md': 'var(--radius-md)',
        'kkookk-lg': 'var(--radius-lg)',
        'kkookk-xl': 'var(--radius-xl)',
      },
      spacing: {
        'kkookk-xs': 'var(--spacing-xs)',
        'kkookk-sm': 'var(--spacing-sm)',
        'kkookk-md': 'var(--spacing-md)',
        'kkookk-lg': 'var(--spacing-lg)',
        'kkookk-xl': 'var(--spacing-xl)',
        'kkookk-2xl': 'var(--spacing-2xl)',
      },
      boxShadow: {
        'kkookk-sm': 'var(--shadow-sm)',
        'kkookk-md': 'var(--shadow-md)',
        'kkookk-lg': 'var(--shadow-lg)',
      },
      fontSize: {
        'kkookk-xs': 'var(--font-size-xs)',
        'kkookk-sm': 'var(--font-size-sm)',
        'kkookk-base': 'var(--font-size-base)',
        'kkookk-lg': 'var(--font-size-lg)',
        'kkookk-xl': 'var(--font-size-xl)',
        'kkookk-2xl': 'var(--font-size-2xl)',
        'kkookk-3xl': 'var(--font-size-3xl)',
      },
      fontFamily: {
        pretendard: 'var(--font-family-pretendard)',
      },
    },
  },
  plugins: [],
}
