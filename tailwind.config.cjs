/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      screens: {
        sm: " 640px",
        md: " 640px",
        lg: " 640px",
        xl: " 640px",
        "2xl": " 640px",
      },
      colors: {
        // Build your palette here
        transparent: "transparent",
        current: "currentColor",
        yellow: colors.amber,
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
