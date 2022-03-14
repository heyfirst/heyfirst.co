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
    "prettier",
  ],
  ignorePatterns: ["**/*.json"],
};
