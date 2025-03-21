/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        customBlue: '#25313D',
        customgreen: '#5CA2A6',
        customgreen2: '#225A58'
      },
    },
  },
  plugins: [require('tailwindcss-primeui')]
}

