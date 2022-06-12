/* eslint-disable @typescript-eslint/no-var-requires */
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { Feed } from "feed";
import { join } from "path";
import matter from "gray-matter";

const DOMAIN_NAME = "https://heyfirst.co";

async function generate() {
  const feed = new Feed({
    title: "First Kanisorn Sutham",
    description: "This is my personal feed!",
    id: "https://heyfirst.co/",
    link: "https://heyfirst.co/",
    favicon: "https://heyfirst.co/static/favicon/favicon-32x32.png",
    feedLinks: {
      json: "https://example.com/json",
      atom: "https://example.com/atom",
    },
    author: {
      name: "Kanisorn Sutham",
      email: "kanisorns.k@gmail.com",
      link: "https://heyfirst.co/about",
    },
  });

  feed.addCategory("Technologie");

  const posts = readdirSync(join(process.cwd(), "content", "blog"));

  posts.map((name) => {
    const content = readFileSync(join(process.cwd(), "content", "blog", name));
    const {
      data: { title, date, summary, image, draft },
    } = matter(content);

    if (draft) return;

    feed.addItem({
      title,
      id: DOMAIN_NAME + "/blog/" + name.replace(/\.mdx?/, ""),
      link: DOMAIN_NAME + "/blog/" + name.replace(/\.mdx?/, ""),
      date: new Date(date),
      description: summary,
      image: DOMAIN_NAME + image,
    });
  });

  writeFileSync("./public/rss.xml", feed.rss2());
  console.log("---- public/rss.xml: created -----");
}

generate();
