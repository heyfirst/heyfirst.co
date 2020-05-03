import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"

const IndexPage: React.FC = () => (
  <Layout>
    <SEO title={"Hey!"} />
    <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
      Hey! I’m First Kanisorn Sutham
    </h1>
    <p className="">
      Everyone know me as Kanisorn Sutham. Also, call me “First” like a
      nickname. I’m a Software Developer Consultant at{" "}
      <a href="#">ThoughtWorks (Thailand)</a>.
    </p>
    <p>
      Currently focused on deliver a quality software and encourage people to
      become better developer. Not just writing the code.
    </p>
    <p>I live in Bangkok, Thailand.</p>
    <p>
      <a href="#">Read about what I’m learning on my blog.</a> It’s updated
      every time I make a breakthrough worth mentioning. I’m currently learning
      more about Software Engineering Practices. Also published in my
      dev.to/heyfirst
    </p>
    <p>
      I’m also on <a href="#">Twitter</a>,<a href="#">LinkedIn</a> and
      <a href="#">GitHub</a>
    </p>
  </Layout>
)

export default IndexPage
