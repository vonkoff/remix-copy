/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(function ({ addBase, theme }) {
      addBase({
        strong: { fontSize: theme('fontSize.xl') },
      });
    }),
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms'),
  ],
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // ! I CANT MAKE ESLINT STOP FROM GETTING RID OF QUOTES AROUND TINY, SM, etc..
    // fontSize: {
    //   '2xl': '1.5rem',
    //   '3xl': '1.875rem',
    //   '4xl': '2.25rem',
    //   '5xl': '3rem',
    //   '6xl': '4rem',
    //   '7xl': '5rem',
    //   tiny: '.5rem',
    //   xs: '.75rem',
    //   sm: '.875rem',
    //   base: '1rem',
    //   lg: '1.125rem',
    //   xl: '1.25rem',
    // },
    screens: {
      '2xl': { max: '1535px' },
      // => @media (max-width: 1535px) { ... }

      xl: { max: '1279px' },
      // => @media (max-width: 1279px) { ... }

      lg: { max: '1023px' },
      // => @media (max-width: 1023px) { ... }

      md: { max: '767px' },
      // => @media (max-width: 767px) { ... }

      sm: { max: '639px' },
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      fontFamily: {
        // sans: ['Atkinson', ...defaultTheme.fontFamily.sans],
        Atkinson: 'ATKINSON, sans',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      fontSize: ['hover'],
    },
  },
};
