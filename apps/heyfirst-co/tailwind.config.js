const colors = require("tailwindcss/colors");
const { spacing } = require("tailwindcss/defaultTheme");

module.exports = {
  purge: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx}",
    "./data/**/*.mdx",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false, // or 'media' or 'class'
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
        gray: colors.gray,
        red: colors.red,
        blue: colors.sky,
        yellow: colors.amber,
        fuchsia: colors.fuchsia,
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.700"),
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
