/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        // one width, rule them all 💍
        sm: "640px",
        md: "640px",
        lg: "640px",
        xl: "640px",
        "2xl": "640px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
