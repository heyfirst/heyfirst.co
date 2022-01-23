const withTM = require("next-transpile-modules")(["@heyfirst/ui"]);

module.exports = withTM({
  reactStrictMode: true,
});
