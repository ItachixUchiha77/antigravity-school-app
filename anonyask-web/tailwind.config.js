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
        'bg-primary':          'rgb(var(--color-bg-primary) / <alpha-value>)',
        'bg-secondary':        'rgb(var(--color-bg-secondary) / <alpha-value>)',
        'bg-elevated':         'rgb(var(--color-bg-elevated) / <alpha-value>)',
        'bg-card':             'rgb(var(--color-bg-card) / <alpha-value>)',
        'accent-blue':         'rgb(var(--color-accent-blue) / <alpha-value>)',
        'accent-blue-light':   'rgb(var(--color-accent-blue-light) / <alpha-value>)',
        'accent-purple':       'rgb(var(--color-accent-purple) / <alpha-value>)',
        'accent-purple-light': 'rgb(var(--color-accent-purple-light) / <alpha-value>)',
        'accent-glow':         'rgb(var(--color-accent-glow) / <alpha-value>)',
        'text-primary':        'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary':      'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted':          'rgb(var(--color-text-muted) / <alpha-value>)',
        'border-subtle':       'rgb(var(--color-border-subtle) / <alpha-value>)',
        'border-default':      'rgb(var(--color-border-default) / <alpha-value>)',
        'success':             'rgb(var(--color-success) / <alpha-value>)',
        'warning':             'rgb(var(--color-warning) / <alpha-value>)',
        'danger':              'rgb(var(--color-danger) / <alpha-value>)',
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
