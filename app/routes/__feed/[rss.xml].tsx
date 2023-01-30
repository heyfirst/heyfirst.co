import { Feed } from "feed";
import { getAllPosts } from "~/utils/mdx.server";

export const loader = async () => {
  const feed = new Feed({
    title: "First Sutham",
    description:
      "A full-stack engineer, frontend enthusiast, writer, living in Helsinki, Finland",
    id: "https://heyfirst.co/",
    link: "https://heyfirst.co/",
    favicon: "https://heyfirst.co/static/favicon/favicon-32x32.png",
    feedLinks: {},
    author: {
      name: "First Sutham",
      email: "kanisorns.k@gmail.com",
      link: "https://heyfirst.co/about",
    },
    copyright: "All rights reserved 2019, First Sutham",
  });

  feed.addCategory("Technologie");

  const posts = await getAllPosts();

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: "https://heyfirst.co/blog/" + post.slug,
      link: "https://heyfirst.co/blog/" + post.slug,
      date: new Date(post.date),
      description: post.summary,
      image: "https://heyfirst.co" + post.image,
    });
  });

  const headers = {
    "Content-Type": "application/xml; charset=utf-8",
    "x-content-type-options": "nosniff",
  };

  return new Response(feed.rss2(), { headers });
};
