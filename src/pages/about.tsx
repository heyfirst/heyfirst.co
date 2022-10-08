import React from "react";
import Container from "@/components/container";
import MDXComponents from "src/services/mdx/mdx-components";
import { MDXRemote } from "next-mdx-remote";
import { getFileBySlug, MDXFile } from "src/services/mdx";
import { GetStaticProps } from "next";

const About: React.FC<MDXFile> = ({ mdxSource }) => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return (
    <Container>
      <main className="prose mb-4">{content}</main>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const about = await getFileBySlug("about");

  return { props: about };
};

export default About;
