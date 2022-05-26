import React from "react";
import Image from "next/image";
import NextLink from "next/link";

const Navbar: React.FC = () => (
  <nav className="container flex items-center justify-between w-full py-4 mx-auto my-0 sticky-nav md:mt-6">
    <div className="flex">
      <NextLink href="/">
        <a className="flex p-3 text-gray-700 transition hover:text-gray-900">
          <div className="mr-1">
            <Image
              alt="Kanisorn Sutham"
              height={24}
              width={24}
              src="/avatar.jpeg"
              className="rounded-full"
            />
          </div>
          <h1>heyfirst.co</h1>
        </a>
      </NextLink>
      <NextLink href="/about">
        <a className="p-3 text-gray-600 transition hover:text-gray-600">
          about
        </a>
      </NextLink>
      <NextLink href="/blog">
        <a className="p-3 text-gray-600 transition hover:text-gray-600">blog</a>
      </NextLink>
    </div>
    <div className="w-4 mr-3 text-sm">
      <a
        href="https://webring.wonderful.software#heyfirst.co"
        title="วงแหวนเว็บ"
      >
        <Image
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
