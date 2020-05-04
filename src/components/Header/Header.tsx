import React from "react"

const Header: React.FC = () => (
  <nav className="flex items-baseline justify-between flex-wrap py-6">
    <div className="flex items-center flex-shrink-0 text-black mr-6">
      <span className="text-xl tracking-wide font-normal font-heading">
        heyfirst.co
      </span>
    </div>
    <div className="w-full block flex-grow md:flex md:items-center md:w-auto">
      <div className="text-sm md:flex-grow">
        <a className="block mt-4 inline-block md:mt-0 text-gray-600 hover:text-gray-800 mr-4 cursor-pointer">
          Blog
        </a>
        <a className="block mt-4 inline-block md:mt-0 text-gray-600 hover:text-gray-800 mr-4 cursor-pointer">
          Tutorials
        </a>
        <a className="block mt-4 inline-block md:mt-0 text-gray-600 hover:text-gray-800 mr-4 cursor-pointer">
          Resume
        </a>
      </div>
    </div>
  </nav>
)

export default Header
