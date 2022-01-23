import React from "react";
import Container from "src/components/Container";
import MDXComponents from "src/components/MDXComponents";
import { MDXRemote } from "next-mdx-remote";
import { getFileBySlug, MDXFile } from "src/lib/mdx";
import ConvertKitSignup from "src/components/ConvertKitSignUp";
import { GetStaticProps } from "next";

const About: React.FC<MDXFile> = ({ mdxSource }) => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return (
    <Container>
      <main className="mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          About
        </h1>
        <div className="mb-4 prose">{content}</div>
        <ConvertKitSignup />
      </main>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const about = await getFileBySlug("about");

  return { props: about };
};

export default About;
