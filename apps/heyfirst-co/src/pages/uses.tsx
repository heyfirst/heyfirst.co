import React from "react";
import Container from "@/components/core/container";
import MDXComponents from "@/components/mdx/mdx-components";
import { MDXRemote } from "next-mdx-remote";
import { getFileBySlug, MDXFile } from "src/lib/mdx";
import { GetStaticProps } from "next";

const Uses: React.FC<MDXFile> = ({ mdxSource }) => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return (
    <Container>
      <main className="mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          /uses
        </h1>
        <div className="mb-4 prose">{content}</div>
      </main>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const uses = await getFileBySlug("uses");

  return { props: uses };
};

export default Uses;
