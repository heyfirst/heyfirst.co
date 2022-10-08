import React from "react";
import { GetStaticProps } from "next";
import { FrontMatter, getAllFilesFrontMatter } from "src/services/mdx";
import BlogPage from "src/services/blog/components/blog-page";

export const getStaticProps: GetStaticProps = async () => {
  const [posts, tags] = await getAllFilesFrontMatter("blog");

  // filter out draft
  const filteredPosts = posts.filter((post) => !post.draft);

  return { props: { posts: filteredPosts, tags } };
};

type Props = { posts: FrontMatter[]; tags: string[] };

const Blog: React.FC<Props> = (props) => {
  return <BlogPage {...props} />;
};

export default Blog;
