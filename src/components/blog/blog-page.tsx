import React from "react";
import { useRouter } from "next/router";
import Fuse from "fuse.js";

import Container from "@/components/core/container";
import BlogPostItem from "@/components/blog/blog-post-item";
import { FrontMatter } from "src/lib/mdx";
import Tag from "../core/tag";

const options = {
  includeScore: true,
  keys: ["title", "tags"],
  threshold: 0, // 100% match only
};

const BlogPage: React.FC<{ posts: FrontMatter[]; tags: string[] }> = ({
  posts,
  tags,
}) => {
  const router = useRouter();
  const { search = "" } = router.query;
  const searchStr: string =
    typeof search === "string" ? search : search.join("") || "";

  const onClickTag = (tag: string) => {
    router.push(`?search=${tag.split(" ").join("+")}`);
  };

  const fuse = new Fuse(posts, options);
  const result = fuse.search(searchStr);
  const filteredPosts =
    searchStr === "" ? posts : result.map((post) => post.item);

  return (
    <Container
      title="Blog | heyfirst.co"
      description="Thoughts on the software industry, programming, tech, videography, music, and my personal life."
    >
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="mb-4 text-3xl font-bold text-black md:text-5xl">
          Blog
        </h1>
        <p className="mb-4 prose text-gray-600">
          I am writing about my life journay, technology & tools, web
          development and software engineering practice I believe.
        </p>
        <p className="mb-4 prose text-gray-600">
          I have my old blog in{" "}
          <a
            href="https://medium.com/ks-journals"
            target="_blank"
            rel="noopener noreferrer"
          >
            Medium
          </a>{" "}
          and I decide to move to personal website because I can deliver better
          experience. {`I've written`} <u>{posts.length}</u> articles on this
          site.
        </p>
        <hr className="my-4" />
        <div className="my-4 text-xs text-center text-gray-600">
          <Tag
            className={search === "" ? "text-yellow-700 border-yellow-700" : ""}
            enableHover
            onClick={() => onClickTag("")}
          >
            all blogs
          </Tag>
          {tags.sort().map((tag) => (
            <Tag
              key={tag}
              enableHover
              className={
                search === tag ? "text-yellow-700 border-yellow-700" : ""
              }
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </Tag>
          ))}
        </div>
        <hr className="my-4" />
        <div className="w-full mb-4">
          {filteredPosts.map((frontMatter) => (
            <BlogPostItem key={frontMatter.title} {...frontMatter} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default BlogPage;
