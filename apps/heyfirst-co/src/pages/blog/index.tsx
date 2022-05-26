import React from "react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Fuse from "fuse.js";

import Container from "@/components/core/container";
import BlogPost from "@/components/blog/blog-post";
import { FrontMatter, getAllFilesFrontMatter } from "src/lib/mdx";
import ConvertKitSignup from "@/components/core/convert-kit-sign-up";

export const getStaticProps: GetStaticProps = async () => {
  const [posts, tags] = await getAllFilesFrontMatter("blog");
  return { props: { posts, tags } };
};

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
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          Blog
        </h1>
        <p className="mb-4 text-sm prose text-gray-600">
          I am writing about my life journay, technology & tools, web
          development and software engineering practice I believe.
        </p>
        <p className="mb-4 text-sm prose text-gray-600">
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
          <span
            className={`
              inline-block px-2 py-1 mb-2 mr-2
              transition-all
              border rounded-md
              cursor-pointer
              hover:text-yellow-700 hover:border-yellow-700
              ${search === "" ? "text-yellow-700 border-yellow-700" : ""}
            `}
            onClick={() => onClickTag("")}
          >
            all blogs
          </span>
          {tags.sort().map((tag) => (
            <span
              key={tag}
              className={`
                inline-block px-2 py-1 mb-2 mr-2
                transition-all
                border rounded-md
                cursor-pointer
                hover:text-yellow-700 hover:border-yellow-700
                ${search === tag ? "text-yellow-700 border-yellow-700" : ""}
              `}
              onClick={() => onClickTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
        <hr className="my-4" />
        <div className="w-full mb-4">
          {filteredPosts.map((frontMatter) => (
            <BlogPost key={frontMatter.title} {...frontMatter} />
          ))}
        </div>
        <ConvertKitSignup />
      </div>
    </Container>
  );
};

export default BlogPage;
