module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  globals: {
    window: "readonly",
    JSX: "readonly",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "react-app",
    // "next",
    // "next/core-web-vitals",
    "prettier",
  ],
  ignorePatterns: ["**/*.json"],
};
