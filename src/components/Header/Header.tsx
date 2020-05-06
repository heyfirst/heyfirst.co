import React from "react"
import { Link } from "gatsby"

const Header: React.FC = () => (
  <nav className="flex items-baseline justify-between flex-wrap py-4">
    <div className="flex items-center flex-shrink-0 mr-6">
      <Link
        to="/"
        className="text-xl tracking-wide font-normal font-heading text-black"
      >
        heyfirst.co
      </Link>
    </div>
    <div className="block flex-grow md:flex md:items-center md:w-auto">
      <div className="text-sm md:flex-grow">
        <Link
          to="/blog"
          className="block mt-4 inline-block md:mt-0 text-indigo-600 mr-4 hover:text-indigo-800 cursor-pointer"
          activeClassName="text-indigo-800 italic"
        >
          Blog
        </Link>
      </div>
    </div>
  </nav>
)

export default Header
