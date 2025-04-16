/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Colores primarios
        'primary-blue': '#0080FF',
        'white': '#FFFFFF',
        
        // Escala de grises
        'gray-1': '#F5F7FA',
        'gray-2': '#E2E2EA',
        'gray-3': '#92929D',
        'gray-4': '#696974',
        'gray-5': '#44444F',
        'gray-6': '#262633',
        'gray-7': '#171725',
        'gray-8': '#0B0B10',
        
        // Colores semánticos
        'semantic.green': '#2CC022',
        'semantic.blue': '#2AB0FC',
        'semantic.yellow': '#FCC132',
        'semantic.orange': '#FF740D',
        'semantic.red': '#FF3F3F',
        primary: 'var(--primary-color)',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif']
      },
      fontSize: {
        // Tamaños según la guía de diseño
        'h1': '26px',
        'h2': '20px',
        'h3': '14px',
        'h4': '12px',
        'p': '12px',
        'p-small': '10px'
      },
      fontWeight: {
        'thin': 100,
        'light': 300,
        'regular': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700
      },
      lineHeight: {
        'standard': '150%' // Según tu guía, todos los elementos usan 150%
      }
    },
  },
  plugins: [],
};

export default config;