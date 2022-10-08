import React from "react";
import Container from "@/components/container";
import { getFileBySlug, MDXFile } from "src/services/mdx";
import { MDXRemote } from "next-mdx-remote";
import MDXComponents from "src/services/mdx/mdx-components";
import WatercolorBGCanvas from "src/services/drawing/watercolor-bg-drawing";
import { GetStaticProps } from "next";

const Home: React.FC<MDXFile> = ({ mdxSource }) => {
  const content = <MDXRemote {...mdxSource} components={MDXComponents} />;

  return (
    <Container>
      <WatercolorBGCanvas />
      <main className="prose mb-4">{content}</main>
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
