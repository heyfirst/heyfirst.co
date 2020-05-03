import React from "react"

const Header: React.FC = () => (
  <nav className="flex items-center justify-between flex-wrap py-6">
    <div className="flex items-center flex-shrink-0 text-black mr-6">
      <span className="font-semibold text-xl tracking-tight">heyfirst.co</span>
    </div>
    <div className="w-full block flex-grow md:flex md:items-center md:w-auto">
      <div className="text-sm md:flex-grow">
        <a className="block mt-4 inline-block md:mt-0 text-teal-600 hover:text-black mr-4">
          Resume
        </a>
        <a className="block mt-4 inline-block md:mt-0 text-teal-600 hover:text-black mr-4">
          Blog
        </a>
      </div>
    </div>
  </nav>
)

export default Header
