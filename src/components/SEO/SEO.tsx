import React from "react"
import { Helmet } from "react-helmet"
import { StaticQuery, graphql } from "gatsby"

type Props = {
  meta?: any
  image?: any
  title: string
  description?: string
  slug?: string
  lang?: "th" | "en"
}

const query = graphql`
  query GetSiteMetadata {
    site {
      siteMetadata {
        title
        author
        description
        siteUrl
        social {
          twitter
        }
      }
    }
  }
`

const SEO: React.FC<Props> = ({
  meta = [],
  image,
  title,
  description,
  slug,
  lang = "th",
}) => (
  <StaticQuery
    query={query}
    render={data => {
      const { siteMetadata } = data.site
      const metaDescription = description || siteMetadata.description
      const metaImage = image ? `${siteMetadata.siteUrl}/${image}` : null
      const url = `${siteMetadata.siteUrl}${slug}`
      return (
        <Helmet
          htmlAttributes={{ lang }}
          {...(title
            ? {
                titleTemplate: `%s | ${siteMetadata.title}`,
                title,
              }
            : {
                title: `${siteMetadata.title}`,
              })}
          meta={[
            {
              name: "charset",
              content: "utf-8",
            },
            {
              name: "description",
              content: metaDescription,
            },
            {
              property: "og:url",
              content: url,
            },
            {
              property: "og:title",
              content: title || siteMetadata.title,
            },
            {
              property: "og:description",
              content: metaDescription,
            },
            {
              name: "twitter:card",
              content: "summary",
            },
            {
              name: "twitter:creator",
              content: siteMetadata.social.twitter,
            },
            {
              name: "twitter:title",
              content: title || siteMetadata.title,
            },
            {
              name: "twitter:description",
              content: metaDescription,
            },
          ]
            .concat(
              metaImage
                ? [
                    {
                      property: "og:image",
                      content: `${metaImage}`,
                    },
                    {
                      name: "twitter:image",
                      content: `${metaImage}`,
                    },
                    {
                      property: "og:image:width",
                      content: 1400,
                    },
                    {
                      property: "og:image:height",
                      content: 751,
                    },
                  ]
                : []
            )
            .concat(meta)}
        />
      )
    }}
  />
)

export default SEO
