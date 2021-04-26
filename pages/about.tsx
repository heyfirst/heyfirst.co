import Container from "@/components/Container";

export default function About() {
  return (
    <Container>
      <main className="mb-16 prose">
        <h1>About Me</h1>
        <p>
          A.k.a "First", I am a Thailand-based developer who specializes in
          building quality software and aims at making software more exciting
          and fun!
        </p>
        <p>
          Currently, I am working at{" "}
          <a href="https://www.thoughtworks.com/" target="_blank">
            ThoughtWorks Thailand
          </a>{" "}
          as a Developer Consultant.
        </p>
      </main>
    </Container>
  );
}
