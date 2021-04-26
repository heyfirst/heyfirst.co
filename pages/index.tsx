import React from "react";
import Container from "@/components/Container";

export default function Home() {
  return (
    <Container>
      <main className="mb-16 prose">
        {/* TODO: Change this to Good Morning, Afternoon, Evening depends on browser time */}
        <h1>Hello! I’m Kanisorn Sutham 👋🏻</h1>
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
      </main>
    </Container>
  );
}
