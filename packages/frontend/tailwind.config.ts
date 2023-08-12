import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'opov': {
          DEFAULT: '#55C076',
          '50': '#f2fbf4',
          '100': '#e1f7e8',
          '200': '#c5edd1',
          '300': '#98ddad',
          '400': '#55c076',
          '500': '#3daa5f',
          '600': '#2e8b4b',
          '700': '#276e3e',
          '800': '#235834',
          '900': '#1f482d',
          '950': '#0c2715',
        }
      },
      dropShadow: {
        'dark': '0 1px 1px rgba(0, 0, 0, 0.3)',
        'darker': '0 1px 1px rgba(0, 0, 0, 0.7)'
      },
    },
  },
  plugins: [],
}
export default config
