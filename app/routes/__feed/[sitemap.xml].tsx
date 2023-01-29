// TODO: add sitemap.xml to robots.txt
export const loader = () => {
  return new Response("<div>123</div>", {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
};
