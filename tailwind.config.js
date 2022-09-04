const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      paua: '#262356',
      air: '#0A59E2',
      ocean: '#1532a7',
      matisse: '#3c5f82',
      heather: '#88639D',
      htest: '#1a0c0e',
      ...colors
    },
    fontFamily: {
      'display': ['BalooRegular']
    }
  },
  plugins: [],
}
