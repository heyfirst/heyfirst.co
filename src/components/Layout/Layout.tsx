import React from "react"
import cx from "classnames"

import Canvas from "../MouseTrail"
import Header from "../Header"
import "./Layout.scss"

const Layout: React.FC = ({ children }) => (
  <React.Fragment>
    <Canvas />
    <div className={cx("container mx-auto")}>
      <Header />
      <div>{children}</div>
    </div>
  </React.Fragment>
)

export default Layout
