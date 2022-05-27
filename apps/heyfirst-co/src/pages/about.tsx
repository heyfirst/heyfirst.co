import React from "react";
import Container from "@/components/core/container";
import MDXComponents from "@/components/mdx/mdx-components";
import { MDXRemote } from "next-mdx-remote";
import { getFileBySlug, MDXFile } from "src/lib/mdx";
import ConvertKitSignup from "@/components/core/convert-kit-sign-up";
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
