import React from "react";
import Image from "next/image";
import ActiveLink from "./active-link";

const MANUES = [
  {
    href: "/blog",
    label: "blog",
  },
  {
    href: "/uses",
    label: "/uses",
  },
];

const Navbar: React.FC = () => {
  const logo = (
    <ActiveLink href="/">
      <a className="flex p-2 text-gray-600 transition hover:text-gray-900">
        <div className="mr-1">
          <Image
            alt="First Sutham"
            height={24}
            width={24}
            src="/avatar.jpeg"
            className="rounded-full"
          />
        </div>
        <h1>heyfirst.co</h1>
      </a>
    </ActiveLink>
  );

  const manu = MANUES.map((manu) => (
    <ActiveLink
      key={manu.label}
      href={manu.href}
      activeClassName="not-italic text-gray-900"
    >
      <a className="p-2 italic text-gray-600 transition hover:text-gray-900">
        {manu.label}
      </a>
    </ActiveLink>
  ));

  const webring = (
    <div className="mr-3 w-4 text-sm">
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
  );

  return (
    <nav className="sticky-nav container mx-auto my-0 flex w-full items-center justify-between py-4 md:mt-6">
      <div className="flex">
        {logo}
        {manu}
      </div>
      {webring}
    </nav>
  );
};

export default Navbar;
