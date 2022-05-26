import { MDXRemote } from "next-mdx-remote";

import { getFiles, getFileBySlug, MDXFile } from "src/lib/mdx";
import BlogLayout from "src/components/layouts/BlogLayout";
import MDXComponents from "src/components/MDXComponents";
import { GetStaticPaths, GetStaticProps } from "next";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getFiles("blog");

  return {
    paths: posts.map((p) => ({
      params: {
        slug: p.replace(/\.mdx/, ""),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getFileBySlug("blog", params.slug as string);

  return { props: post };
};

const Blog: React.FC<MDXFile> = ({ mdxSource, frontMatter }): JSX.Element => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return <BlogLayout frontMatter={frontMatter}>{content}</BlogLayout>;
};

export default Blog;
