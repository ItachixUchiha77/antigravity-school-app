/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': '#07080F',
        'bg-secondary': '#0E1117',
        'bg-elevated': '#141822',
        'bg-card': '#1A2030',
        'accent-blue': '#2563EB',
        'accent-blue-light': '#3B82F6',
        'accent-purple': '#7C3AED',
        'accent-purple-light': '#A855F7',
        'accent-glow': '#3B82F6',
        'text-primary': '#F1F5F9',
        'text-secondary': '#CBD5E1',
        'text-muted': '#64748B',
        'border-subtle': '#1E2433',
        'border-default': '#252D3D',
        'success': '#22C55E',
        'warning': '#F59E0B',
        'danger': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37,99,235,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(37,99,235,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(37,99,235,0.4)',
        'glow-purple': '0 0 20px rgba(124,58,237,0.4)',
        'glow-sm': '0 0 10px rgba(37,99,235,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
