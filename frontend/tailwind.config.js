export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter','sans-serif'] },
      colors: {
        navy: '#070B14', surface: '#0D1424', card: '#0F1A2E',
        accent: '#3B82F6', 'accent-bright': '#60A5FA',
      }
    }
  },
  plugins: []
}
