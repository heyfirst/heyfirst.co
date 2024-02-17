/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  // FIXME: here is a limitation of remix, that we can't import esm packages
  // https://remix.run/docs/en/v1/pages/gotchas#importing-esm-packages
  serverDependenciesToBundle: [
    /^micromark.*/,
    /^rehype.*/,
    /^remark.*/,
    /^unified.*/,
    /^unist.*/,
    /^mdast.*/,
    /^hast-util.*/,
    "ccount",
    "decode-named-character-reference",
    "character-entities",
    "markdown-table",
    "github-slugger",
    "lowlight",
    "fault",
    /^lit.*/,
    /^@lit.*/,
    "giscus",
  ],
};
