import React from "react"
import Helmet from "react-helmet"

const BlogPage: React.FC = () => (
  <div>
    <Helmet title={"Blog"} defer={false} />
    <h1>Blog</h1>
  </div>
)

export default BlogPage
