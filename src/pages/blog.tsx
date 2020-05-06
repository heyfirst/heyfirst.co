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
  excerpt: string
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
    {allMdx.nodes.map((post: Post) => (
      <div key={post.fields.slug}>
        <Link
          to={post.fields.slug}
          className="blog-listing mb-4 block relative"
        >
          <div className="blog-feature-image">
            <Img
              className="h-64"
              fluid={post.frontmatter.featuredImage.childImageSharp.fluid}
            />
          </div>
          <div className="absolute top-0 text-white">
            <h3 className="mt-4 mb-0 underline">{post.frontmatter.title}</h3>
            <div className="text-sm leading-6 italic">{post.excerpt}</div>
            <div className="text-sm leading-6 italic">
              {formatPostDate(post.frontmatter.date)}
              {` • ${formatReadingTime(post.timeToRead)}`}
            </div>
          </div>
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
        excerpt(pruneLength: 160)
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
