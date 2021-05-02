import React from "react";
import Container from "@/components/Container";
import { getFileBySlug } from "@/lib/mdx";
import hydrate from "next-mdx-remote/hydrate";
import MDXComponents from "@/components/MDXComponents";

export default function Home({ mdxSource }) {
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  });

  return (
    <Container>
      <main className="mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          Hey! 👋🏻 <br />
          I'm Kanisorn Sutham
        </h1>
        <div className="prose">{content}</div>
      </main>
    </Container>
  );
}

export async function getStaticProps() {
  const index = await getFileBySlug("index");

  return { props: index };
}
