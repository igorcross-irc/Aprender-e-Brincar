module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // Alternativas para navegadores antigos (iOS 9…): ver scripts/postcss-legacy.cjs
    require('./scripts/postcss-legacy.cjs')
  ]
};
