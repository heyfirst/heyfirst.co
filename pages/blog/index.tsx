import React from "react";
import Container from "@/components/Container";
import BlogPost from "@/components/BlogPost";
import { FrontMatter, getAllFilesFrontMatter } from "@/lib/mdx";
import ConvertKitSignup from "@/components/ConvertKitSignUp";
import { GetStaticProps } from "next";

const Blog: React.FC<{ posts: FrontMatter[] }> = ({ posts }) => {
  return (
    <Container
      title="Blog | heyfirst.co"
      description="Thoughts on the software industry, programming, tech, videography, music, and my personal life."
    >
      <div className="max-w-2xl mx-auto mb-8">
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
          experience. {`I've written`} <u>{posts.length}</u> articles on this
          site.
        </p>
        <hr className="my-4" />
        <div className="mb-4 w-full">
          {posts.map((frontMatter) => (
            <BlogPost key={frontMatter.title} {...frontMatter} />
          ))}
        </div>
        <ConvertKitSignup />
      </div>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const posts = await getAllFilesFrontMatter("blog");
  return { props: { posts } };
};

export default Blog;
