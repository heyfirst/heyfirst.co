import hydrate from "next-mdx-remote/hydrate";

import { getFiles, getFileBySlug, MDXFile } from "@/lib/mdx";
import BlogLayout from "@/components/layouts/BlogLayout";
import MDXComponents from "@/components/MDXComponents";
import { GetStaticPaths, GetStaticProps } from "next";

const Blog: React.FC<MDXFile> = ({ mdxSource, frontMatter }): JSX.Element => {
  const content = hydrate(mdxSource, {
    components: {
      ...MDXComponents,
    },
  });

  return <BlogLayout frontMatter={frontMatter}>{content}</BlogLayout>;
};

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

export default Blog;
