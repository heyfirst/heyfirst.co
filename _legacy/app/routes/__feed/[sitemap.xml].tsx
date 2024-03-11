import { parseISO } from "date-fns";
import formatDate from "date-fns/format";
import { getAllPosts } from "~/utils/mdx.server";

export const loader = async () => {
  const posts = await getAllPosts();

  const postItems = posts.map((post) => {
    return [
      `<url>`,
      `<loc>https://heyfirst.co/blog/${post.slug}</loc>`,
      `<lastmod>${formatDate(parseISO(post.date), "yyyy-MM-dd")}</lastmod>`,
      `</url>`,
    ].join("");
  });

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,

    // index page, or /blog page
    `<url>`,
    `<loc>https://heyfirst.co/</loc>`,
    `</url>`,
    `<url>`,
    `<loc>https://heyfirst.co/todo</loc>`,
    `</url>`,
    ...postItems,
    `</urlset>`,
  ];

  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "x-content-type-options": "nosniff",
  };

  return new Response(xml.join(""), { headers });
};
