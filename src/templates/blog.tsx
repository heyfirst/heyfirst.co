import React from "react"
import { Link, graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import Img from "gatsby-image"

import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { formatPostDate, formatReadingTime } from "../utils/dates"

import "./blog.css"

type Props = {
  data: any
  pageContext: any
}

const PageTemplate: React.FC<Props> = ({
  data: { mdx, site },
  pageContext,
}) => {
  const { previous, next } = pageContext
  const coverImgObj = mdx.frontmatter.featuredImage
    ? mdx.frontmatter.featuredImage.childImageSharp.sizes
    : null

  return (
    <Layout>
      <SEO
        title={mdx.frontmatter.title}
        description={mdx.excerpt}
        slug={mdx.fields.slug}
        image={coverImgObj ? coverImgObj.src : null}
      />
      <section className="center blog">
        <article className="container small">
          <header className="relative">
            <div className="background">
              <Img
                fluid={mdx.frontmatter.featuredImage.childImageSharp.sizes}
              />
            </div>
            <div className="w-full text-center text-white info">
              <h1 className="mt-2 text-3xl font-bold leading-8 font-heading sm:text-4xl sm:leading-10">
                {mdx.frontmatter.title}
              </h1>
              <p className="text-sm">
                {formatPostDate(mdx.frontmatter.date)}
                {` • ${formatReadingTime(mdx.timeToRead)}`}
              </p>
            </div>
          </header>

          <MDXRenderer>{mdx.body}</MDXRenderer>
        </article>
        <footer className="container small">
          <hr
            style={{
              margin: `24px 0`,
            }}
          />
          <div className="p-0">
            <div className="mb-4">
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </div>
            <div className="text-right">
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </div>
          </div>
        </footer>
      </section>
    </Layout>
  )
}

export default PageTemplate

export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    site {
      siteMetadata {
        siteUrl
        githubUrl
      }
    }
    mdx(id: { eq: $id }) {
      fields {
        slug
      }
      excerpt(pruneLength: 160)
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        canonical_link
        featuredImage {
          childImageSharp {
            sizes(quality: 80) {
              ...GatsbyImageSharpSizes_withWebp
            }
          }
        }
      }
      body
    }
  }
`
