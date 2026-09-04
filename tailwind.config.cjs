/** @type {import('tailwindcss').Config} */
// Content globs must stay inside this repo — a glob pointing outside it makes Tailwind v4's
// @config compat layer fail to resolve and silently emit no utilities for those paths.
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
