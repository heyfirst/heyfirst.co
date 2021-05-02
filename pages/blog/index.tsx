import React from "react";
import Container from "@/components/Container";
import BlogPost from "@/components/BlogPost";
import { getAllFilesFrontMatter } from "@/lib/mdx";

export default function Blog({ posts }) {
  return (
    <Container
      title="Blog | heyfirst.co"
      description="Thoughts on the software industry, programming, tech, videography, music, and my personal life."
    >
      <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
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
          experience. I've written <u>{posts.length}</u> articles on this site.
        </p>
        <h3 className="mt-8 mb-4 text-2xl font-bold tracking-tight text-black md:text-4xl">
          All Posts
        </h3>
        {posts.map((frontMatter) => (
          <BlogPost key={frontMatter.title} {...frontMatter} />
        ))}
      </div>
    </Container>
  );
}

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter("blog");

  return { props: { posts } };
}
