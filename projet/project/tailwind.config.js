/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'HelveticaNeue': ['HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'],
        'Helvetica_Neue': ['HelveticaNeue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      spacing: {
        // Mobile
        'roar-x-mobile': '17.22px',
        'roar-y-mobile': '18px',
        // Desktop/Tablette (md et plus)
        'roar-x-desktop': '39.91px',
        'roar-y-desktop': '28px',
      },
      colors: {
        'custom-grey': '#D1D1D1',
        'greyh': '#D1D1D1',
      },
    },
  },
}
