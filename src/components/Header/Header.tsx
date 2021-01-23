import React from "react"
import { Link } from "gatsby"

const Header: React.FC = () => (
  <nav className="flex flex-wrap items-center justify-between py-4">
    <div className="flex items-center flex-shrink-0 mr-6">
      <Link
        to="/"
        className="text-xl font-normal tracking-wide text-black no-underline font-heading"
      >
        heyfirst.co
      </Link>
    </div>
    <div className="flex-grow block md:flex md:items-center md:w-auto">
      <div className="text-sm md:flex-grow">
        <Link
          to="/blog"
          className="inline-block mt-4 mr-4 text-indigo-600 cursor-pointer md:mt-0 hover:text-indigo-700"
          activeClassName="text-indigo-700 italic"
        >
          Blog
        </Link>
      </div>
    </div>
    <div className="w-4 mr-auto text-sm">
      <a
        href="https://webring.wonderful.software#heyfirst.co"
        title="วงแหวนเว็บ"
      >
        <img
          alt="วงแหวนเว็บ"
          width="32"
          height="32"
          src="https://webring.wonderful.software/webring.black.svg"
        />
      </a>
    </div>
  </nav>
)

export default Header
