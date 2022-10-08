import React from "react";
import Container from "@/components/container";
import MDXComponents from "src/services/mdx/mdx-components";
import { MDXRemote } from "next-mdx-remote";
import { getFileBySlug, MDXFile } from "src/services/mdx";
import { GetStaticProps } from "next";

const Uses: React.FC<MDXFile> = ({ mdxSource, frontMatter }) => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return (
    <Container
      title={`${frontMatter.title} | heyfirst.co`}
      description={frontMatter.summary}
      image={`https://heyfirst.co${frontMatter.image}`}
      date={new Date(frontMatter.date).toISOString()}
      type="article"
      tags={frontMatter.tags}
    >
      <main className="mb-16">
        <h1 className="mb-4 text-3xl font-bold text-black md:text-5xl">
          /uses
        </h1>
        <div className="prose mb-4">{content}</div>
      </main>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const uses = await getFileBySlug("uses");

  return { props: uses };
};

export default Uses;
