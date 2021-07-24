import React from "react";
import Container from "@/components/Container";
import { getAllFilesFrontMatter } from "@/lib/mdx";
import ConvertKitSignup from "@/components/ConvertKitSignUp";

export default function Books({ books }) {
  return (
    <Container
      title="Books | heyfirst.co"
      description="Thoughts on the software industry, programming, tech, videography, music, and my personal life."
    >
      <div className="flex flex-col items-start justify-center max-w-2xl mx-auto mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          Bookshelf 📚
        </h1>
        <p className="mb-4 prose text-gray-600">
          I love to collect and read books so much! And I will use this page to
          keep my books as my personal bookshelf
        </p>
        <div className="mb-4 prose text-gray-600">
          I will share my opinion about those book here like{" "}
          <i>when you may need it, who may need it</i>. Definitely, I won't have
          a star ⭐️ for those (cuz' its seems meaningless, LOL)
        </div>
        <p className="mb-4 prose text-gray-600">
          I have <u>{books.length}</u> in the bookshelf.
        </p>
        <div className="mb-4">
          {books.map((frontMatter) => (
            <div>{frontMatter.title}</div>
          ))}
        </div>
        <ConvertKitSignup />
      </div>
    </Container>
  );
}

export async function getStaticProps() {
  const books = await getAllFilesFrontMatter("books");

  return { props: { books } };
}
