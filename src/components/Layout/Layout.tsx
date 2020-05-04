import React from "react"
import cx from "classnames"
import styles from "./Layout.module.scss"

import Canvas from "../MouseTrail"
import Header from "../Header"

const Layout: React.FC = ({ children }) => (
  <React.Fragment>
    <Canvas />
    <div className="container mx-auto p-4 antialiased font-sans font-light font-sans leading-7">
      <Header />
      <div>{children}</div>
    </div>
  </React.Fragment>
)

export default Layout
