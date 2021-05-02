import React from "react";
import NextLink from "next/link";

const Navbar = () => (
  <nav className="container flex items-center justify-between w-full py-6 mx-auto my-0 bg-white sticky-nav md:my-6 bg-opacity-60">
    <div>
      <NextLink href="/">
        <a className="p-3 text-gray-700 transition hover:text-gray-900">
          heyfirst.co
        </a>
      </NextLink>
      <NextLink href="/about">
        <a className="p-3 text-gray-500 transition hover:text-gray-600">
          about
        </a>
      </NextLink>
      <NextLink href="/blog">
        <a className="p-3 text-gray-500 transition hover:text-gray-600">blog</a>
      </NextLink>
    </div>
    <div className="w-4 mr-3 text-sm">
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
);

export default Navbar;
