import React from "react"
import cx from "classnames"
import styles from "./Layout.module.scss"

import Canvas from "../MouseTrail"
import Header from "../Header"

const Layout: React.FC = ({ children }) => (
  <React.Fragment>
    <Canvas />
    <div className={cx("container", styles.root)}>
      <Header />
      <div>{children}</div>
    </div>
  </React.Fragment>
)

export default Layout
