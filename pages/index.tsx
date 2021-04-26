import React from "react";
import Container from "@/components/Container";

export default function Home() {
  return (
    <Container>
      <main className="mb-16">
        {/* TODO: Change this to Good Morning, Afternoon, Evening depends on browser time */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-5xl">
          Hey! 👋🏻 <br />
          I'm Kanisorn Sutham
        </h1>
        <div className="prose">
          <p>
            A.k.a "First", I am a Thailand-based developer who specializes in
            building quality software and aims at making software more exciting
            and fun!
          </p>
          <p>
            Currently, I am working at{" "}
            <a
              href="https://www.thoughtworks.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ThoughtWorks Thailand
            </a>{" "}
            as a Developer Consultant.
          </p>
        </div>
      </main>
    </Container>
  );
}
