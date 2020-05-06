import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { Link } from "gatsby"

const IndexPage: React.FC = () => (
  <Layout>
    <SEO title={"Hey!"} />
    <h1 className="font-heading font-normal mt-2 text-3xl leading-8 tracking-wide text-indigo-900 sm:text-4xl sm:leading-10">
      Hey! I’m First.
    </h1>
    <p className="my-3 whitespace-pre-wrap">
      Everyone know me as <i>Kanisorn Sutham</i>. Also, call me “First” like a
      nickname. I’m a{" "}
      <span className="italic">Software Developer Consultant</span> at{" "}
      <a href="https://www.thoughtworks.com/" target="_blank">
        ThoughtWorks (Thailand)
      </a>
      .
    </p>
    <p className="my-3 whitespace-pre-wrap">
      Currently <i>focused</i> on deliver a quality software and encourage
      people to become better developer. Not just writing the code.
    </p>
    <p className="my-3 whitespace-pre-wrap">I live in Bangkok, Thailand.</p>
    <p className="my-3 whitespace-pre-wrap">
      <Link to="/blog">Read about what I’m learning on my blog.</Link> It’s
      updated every time I make a breakthrough worth mentioning. I’m currently
      learning more about Software Engineering Practices. Also published in my{" "}
      <a href="https://dev.to/heyfirst" target="_blank">
        dev.to/heyfirst
      </a>
    </p>
    <p className="my-3 whitespace-pre-wrap">
      I’m also on{" "}
      <a href="https://www.linkedin.com/in/kanisorn-sutham/" target="_blank">
        LinkedIn
      </a>{" "}
      and{" "}
      <a href="https://github.com/heyfirst" target="_blank">
        GitHub
      </a>
    </p>
  </Layout>
)

export default IndexPage
