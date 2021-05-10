import React from "react";
import Container from "@/components/Container";
import { getFileBySlug } from "@/lib/mdx";
import hydrate from "next-mdx-remote/hydrate";
import MDXComponents from "@/components/MDXComponents";
import WatercolorBGCanvas from "@/components/WatercolorBGCanvas/WatercolorBGCanvas";
import ConvertKitSignup from "@/components/ConvertKitSignUp";

export default function Home({ mdxSource }) {
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  });

  return (
    <Container>
      <main className="mb-16">
        <WatercolorBGCanvas />
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          Hey! 👋🏻 <br />
          I'm Kanisorn Sutham
        </h1>
        <div className="mb-4 prose">{content}</div>
      </main>
      <style jsx>{`
        .prose {
          filter: drop-shadow(2px 2px 9px rgb(255, 255, 255));
        }
      `}</style>
    </Container>
  );
}

export async function getStaticProps() {
  const index = await getFileBySlug("index");

  return { props: index };
}
