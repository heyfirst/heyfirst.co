import React from "react";
import Container from "src/components/Container";
import { getFileBySlug, MDXFile } from "src/lib/mdx";
import hydrate from "next-mdx-remote/hydrate";
import MDXComponents from "src/components/MDXComponents";
import WatercolorBGCanvas from "src/components/watercolor-bg-canvas/WatercolorBGCanvas";
import { GetStaticProps } from "next";

const Home: React.FC<MDXFile> = ({ mdxSource }) => {
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  });

  return (
    <Container>
      <main className="mb-16">
        <WatercolorBGCanvas />
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
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
