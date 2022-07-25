import React from "react";
import Container from "@/components/core/container";
import { getFileBySlug, MDXFile } from "src/lib/mdx";
import { MDXRemote } from "next-mdx-remote";
import MDXComponents from "@/components/mdx/mdx-components";
import WatercolorBGCanvas from "@/components/watercolor-bg-canvas/watercolor-bakcground-canvas";
import { GetStaticProps } from "next";

const Home: React.FC<MDXFile> = ({ mdxSource }) => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return (
    <Container>
      <main className="mb-16">
        <WatercolorBGCanvas />
        <h1 className="mb-4 text-3xl font-bold text-black md:text-5xl">
          Hey! 👋🏻 <br />
          {`I'm Kanisorn Sutham`}
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
};

export const getStaticProps: GetStaticProps = async () => {
  const index = await getFileBySlug("index");
  return { props: index };
};

export default Home;
