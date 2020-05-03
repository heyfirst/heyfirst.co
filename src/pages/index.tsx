import React from "react"
import Helmet from "react-helmet"

const IndexPage: React.FC = () => (
  <div>
    <Helmet title={"Blog"} defer={false} />
    <h1>Index</h1>
  </div>
)

export default IndexPage
