/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require("tailwindcss/colors");
const { spacing } = require("tailwindcss/defaultTheme");
const defaultTheme = require("tailwindcss/defaultTheme");

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
      fontFamily: {
        sans: ["Fira Code", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Build your palette here
        transparent: "transparent",
        current: "currentColor",
        yellow: colors.amber,
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.600"),
            a: {
              color: theme("colors.yellow.600"),
              "&:hover": {
                color: theme("colors.yellow.800"),
              },
              code: { color: theme("colors.yellow.600") },
            },
            "h2,h3,h4": {
              "scroll-margin-top": spacing[32],
            },
            code: { color: theme("colors.pink.600") },
            blockquote: {
              color: theme("colors.gray.500"),
              fontWeight: 400,
            },
            "blockquote p:first-of-type::before": false,
            "blockquote p:last-of-type::after": false,
          },
        },
      }),
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
