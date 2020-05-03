import React from "react"
import cx from "classnames"
import styles from "./Layout.module.scss"

const Layout: React.FC = ({ children }) => (
  <div className={cx(styles["root"])}>{children}</div>
)

export default Layout
