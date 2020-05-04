import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"

const IndexPage: React.FC = () => (
  <Layout>
    <SEO title={"Hey!"} />
    <h1 className="font-heading font-normal mt-2 text-3xl leading-8 tracking-wide text-gray-900 sm:text-4xl sm:leading-10">
      Hey! I’m First.
    </h1>
    <p className="my-2">
      Everyone know me as <i>Kanisorn Sutham</i>. Also, call me “First” like a
      nickname. I’m a <u>Software Developer Consultant</u> at{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="#"
      >
        ThoughtWorks (Thailand)
      </a>
      .
    </p>
    <p className="my-2">
      Currently <i>focused</i> on deliver a quality software and encourage
      people to become better developer. Not just writing the code.
    </p>
    <p className="my-2">I live in Bangkok, Thailand.</p>
    <p className="my-2">
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="#"
      >
        Read about what I’m learning on my blog.
      </a>{" "}
      It’s updated every time I make a breakthrough worth mentioning. I’m
      currently learning more about Software Engineering Practices. Also
      published in my{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="#"
      >
        dev.to/heyfirst
      </a>
    </p>
    <p className="my-2">
      I’m also on{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="#"
      >
        Twitter
      </a>
      ,{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="#"
      >
        LinkedIn
      </a>{" "}
      and{" "}
      <a
        className="bg-gray-200 px-2 py-1 text-sm font-normal cursor-pointer hover:bg-gray-300"
        href="#"
      >
        GitHub
      </a>
    </p>
  </Layout>
)

export default IndexPage
