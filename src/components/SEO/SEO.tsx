import React from "react"
import { Helmet } from "react-helmet"

type Props = {
  title: string
}
const SEO: React.FC<Props> = ({ title }) => (
  <Helmet
    defaultTitle="heyfirst.co"
    titleTemplate="heyfirst.co | %s"
    defer={false}
  >
    <meta charSet="utf-8" />
    <title>{title}</title>
  </Helmet>
)

export default SEO
