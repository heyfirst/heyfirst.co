import React from "react";
import Container from "@/components/Container";
import MDXComponents from "@/components/MDXComponents";
import hydrate from "next-mdx-remote/hydrate";
import { getFileBySlug, MDXFile } from "@/lib/mdx";
import ConvertKitSignup from "@/components/ConvertKitSignUp";
import { GetStaticProps } from "next";

const About: React.FC<MDXFile> = ({ mdxSource }): JSX.Element => {
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  });

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
