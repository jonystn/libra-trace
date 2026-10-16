/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        origin: {
          surface: 'var(--origin-color-background-base-default)',
          subdued: 'var(--origin-color-background-base-subdued)',
          muted: 'var(--origin-color-background-business-default)',
          ink: 'var(--origin-color-text-base-default)',
          'ink-subdued': 'var(--origin-color-text-base-subdued)',
          inverse: 'var(--origin-color-background-base-inverse)',
          'inverse-ink': 'var(--origin-color-text-base-inverse)',
          line: 'var(--origin-color-border-base-subdued)',
          'line-muted': 'var(--origin-color-border-base-muted)',
          success: 'var(--origin-color-text-success-default)',
          'success-fill': 'var(--origin-color-fill-success-subdued)',
          'success-line': 'var(--origin-color-border-success-subdued)',
          warning: 'var(--origin-color-text-warning-default)',
          'warning-fill': 'var(--origin-color-fill-warning-subdued)',
          'warning-line': 'var(--origin-color-border-warning-default)',
          critical: 'var(--origin-color-text-critical-default)',
          'critical-fill': 'var(--origin-color-fill-critical-subdued)',
          'critical-line': 'var(--origin-color-border-critical-subdued)',
        },
      },
      borderRadius: {
        origin: 'var(--origin-radius-medium)',
        'origin-lg': 'var(--origin-radius-large)',
        'origin-sm': 'var(--origin-radius-small)',
      },
      boxShadow: {
        origin: 'var(--origin-elevation-base-low)',
        'origin-md': 'var(--origin-elevation-base-medium)',
      },
      keyframes: {
        'text-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'text-shimmer': 'text-shimmer 2.5s infinite linear',
      },
    },
  },
  plugins: [],
};
