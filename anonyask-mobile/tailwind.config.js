/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'bg-primary':          '#07080F',
        'bg-secondary':        '#0E1117',
        'bg-elevated':         '#141822',
        'bg-card':             '#1A2030',
        'accent-blue':         '#2563EB',
        'accent-blue-light':   '#3B82F6',
        'accent-purple':       '#7C3AED',
        'accent-purple-light': '#A855F7',
        'text-primary':        '#F1F5F9',
        'text-secondary':      '#CBD5E1',
        'text-muted':          '#64748B',
        'border-subtle':       '#1E2433',
        'border-default':      '#252D3D',
        success:               '#22C55E',
        warning:               '#F59E0B',
        danger:                '#EF4444',
      },
    },
  },
  plugins: [],
};
