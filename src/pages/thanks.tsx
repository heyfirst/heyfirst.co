import React from "react";
import Container from "src/components/Container";
import { MDXFile } from "src/lib/mdx";

const ThanksPage: React.FC<MDXFile> = () => {
  return (
    <Container>
      <main className="mb-16">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          Thank you!
        </h1>
        <div className="mb-4 prose">
          <p>
            Thank you for subscribing, You are confirmed now. You can expect to
            receive emails as I create new content.
          </p>
          <p>Hope you enjoy!</p>
        </div>
      </main>
    </Container>
  );
};

export default ThanksPage;
