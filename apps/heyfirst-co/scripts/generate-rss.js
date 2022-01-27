const { readFileSync, readdirSync, writeFileSync } = require("fs");
const { Feed } = require("feed");
const { join } = require("path");
const matter = require("gray-matter");

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

  const posts = readdirSync(join(process.cwd(), "data", "blog"));

  posts.map((name) => {
    const content = readFileSync(join(process.cwd(), "data", "blog", name));
    const {
      data: { title, date, summary },
    } = matter(content);

    feed.addItem({
      title,
      url: "https://heyfirst.co/blog/" + name.replace(/\.mdx?/, ""),
      date: new Date(date),
      description: summary,
    });
  });

  writeFileSync("./public/rss.xml", feed.rss2());
}

generate();
