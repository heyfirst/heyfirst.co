// TODO: add rss feed and add to sitemap
// https://github.com/heyfirst/heyfirst.co/blob/ede167d85a6f03a15a0e1e79462a6f0c178cead7/src/services/rss/generate-rss.mjs
export const loader = () => {
  return new Response("<div>123</div>", {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
};
