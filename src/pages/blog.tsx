import React from "react"
import { graphql, Link } from "gatsby"
import Img from "gatsby-image"

import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { formatPostDate, formatReadingTime } from "../utils/dates"

type Post = {
  fields: {
    slug: string
  }
  timeToRead: number
  frontmatter: {
    title: string
    date: Date
    featuredImage: any
  }
}

type Props = {
  data: { allMdx: any }
}

const BlogPage: React.FC<Props> = ({ data: { allMdx } }) => (
  <Layout>
    <SEO title={"Blog"} />
    <h1>Blog</h1>
    {allMdx.nodes.map((post: Post) => (
      <div key={post.fields.slug}>
        <Link to={post.fields.slug} className="blog-listing">
          <Img fluid={post.frontmatter.featuredImage.childImageSharp.fluid} />
          <h1>{post.frontmatter.title}</h1>
          <p>
            {formatPostDate(post.frontmatter.date)}
            {` • ${formatReadingTime(post.timeToRead)}`}
          </p>
        </Link>
      </div>
    ))}
  </Layout>
)

export default BlogPage

export const query = graphql`
  query BlogIndex {
    allMdx(
      filter: { fields: { published: { eq: true } } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      nodes {
        fields {
          slug
        }
        timeToRead
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          featuredImage {
            childImageSharp {
              fluid(maxWidth: 300, quality: 80) {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
      }
    }
  }
`
