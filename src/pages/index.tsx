import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { Link } from "gatsby"

const IndexPage: React.FC = () => (
  <Layout>
    <SEO title={"Hey!"} />
    <h1 className="font-heading font-normal mt-2 text-3xl leading-8 tracking-wide text-gray-900 sm:text-4xl sm:leading-10">
      Hey! I’m First.
    </h1>
    <p className="my-3">
      Everyone know me as <i>Kanisorn Sutham</i>. Also, call me “First” like a
      nickname. I’m a{" "}
      <span className="italic underline">Software Developer Consultant</span> at{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="https://www.thoughtworks.com/"
        target="_blank"
      >
        ThoughtWorks (Thailand)
      </a>
      .
    </p>
    <p className="my-3">
      Currently <i>focused</i> on deliver a quality software and encourage
      people to become better developer. Not just writing the code.
    </p>
    <p className="my-3">I live in Bangkok, Thailand.</p>
    <p className="my-3">
      <Link
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        to="/blog"
      >
        Read about what I’m learning on my blog.
      </Link>{" "}
      It’s updated every time I make a breakthrough worth mentioning. I’m
      currently learning more about Software Engineering Practices. Also
      published in my{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="https://dev.to/heyfirst"
        target="_blank"
      >
        dev.to/heyfirst
      </a>
    </p>
    <p className="my-3">
      I’m also on{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="https://www.linkedin.com/in/kanisorn-sutham/"
        target="_blank"
      >
        LinkedIn
      </a>{" "}
      and{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="https://github.com/heyfirst"
        target="_blank"
      >
        GitHub
      </a>
    </p>
  </Layout>
)

export default IndexPage
