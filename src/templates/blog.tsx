import React from "react"
import { Link, graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"

import SEO from "../components/seo"
import Layout from "../components/Layout"
import { formatPostDate, formatReadingTime } from "../utils/dates"

import "./blog.scss"

export default function PageTemplate({ data: { mdx, site }, pageContext }) {
  const { previous, next } = pageContext
  const publicUrl = `${site.siteMetadata.siteUrl}${mdx.fields.slug}`

  return (
    <Layout>
      <SEO title={mdx.frontmatter.title} />
      <section className="center blog">
        <article className="container small">
          <header>
            <h1 className="font-heading font-normal mt-2 text-3xl leading-8 text-gray-900 sm:text-4xl sm:leading-10">
              {mdx.frontmatter.title}
            </h1>
            <p className="text-sm">
              {formatPostDate(mdx.frontmatter.date)}
              {` • ${formatReadingTime(mdx.timeToRead)}`}
            </p>
          </header>

          <MDXRenderer>{mdx.body}</MDXRenderer>
        </article>
        <footer className="container small">
          <small>
            <a
              target="_blank"
              rel="nofollow noopener noreferrer"
              href={`${site.siteMetadata.githubUrl}/edit/master/content${mdx.fields.slug}index.md`}
            >
              Edit this post on GitHub
            </a>
          </small>
          <hr
            style={{
              margin: `24px 0`,
            }}
          />
          <ul
            style={{
              display: `flex`,
              flexWrap: `wrap`,
              justifyContent: `space-between`,
              listStyle: `none`,
              padding: 0,
            }}
          >
            <li>
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={next.fields.slug} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
        </footer>
      </section>
    </Layout>
  )
}

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
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        canonical_link
      }
      body
    }
  }
`
