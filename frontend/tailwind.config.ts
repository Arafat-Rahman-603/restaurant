import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',
          50: '#FFF3E8',
          100: '#FFE4C4',
          200: '#FFC285',
          300: '#FF9E45',
          400: '#FF8220',
          500: '#FF6B00',
          600: '#E05E00',
          700: '#B34B00',
          800: '#8A3900',
          900: '#6B2C00',
        },
        accent: {
          DEFAULT: '#E63946',
          light: '#FF6B76',
          dark: '#B02832',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          50: '#1A1A1A',
          100: '#141414',
          200: '#1E1E1E',
          300: '#252525',
          400: '#2A2A2A',
          500: '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FF6B00 0%, #E63946 100%)',
        'card-gradient': 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
        'dark-gradient': 'linear-gradient(135deg, #141414 0%, #1A1A1A 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 0, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(255, 107, 0, 0.3)',
        'glow-lg': '0 0 60px rgba(255, 107, 0, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
