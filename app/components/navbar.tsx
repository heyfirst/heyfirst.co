import React from "react";
import cx from "classnames";
import { NavLink } from "@remix-run/react";

const NavLinks = [
  {
    href: "/blog",
    label: "📔 blog",
  },
  {
    href: "/blog/uses",
    label: "💻 uses",
  },
];

const Navbar: React.FC = () => {
  return (
    <nav className="container mx-auto flex w-full items-center justify-between py-4 md:mt-6">
      <div className="flex">
        <NavLink
          to="/"
          aria-label="First Sutham"
          className="flex pr-4 text-gray-700 transition hover:text-gray-900"
        >
          <img
            className="mr-1 h-6 w-6 rounded-full"
            alt="First Sutham"
            src="/avatar.jpeg"
          />
          heyfirst.co
        </NavLink>
        {NavLinks.map((manu) => (
          <NavLink
            key={manu.label}
            to={manu.href}
            className={({ isActive }) =>
              cx("pr-4 transition hover:text-gray-900", {
                "text-gray-700": isActive,
                "text-gray-500": !isActive,
              })
            }
          >
            {manu.label}
          </NavLink>
        ))}
      </div>
      <div className="mr-3 w-4 text-sm">
        <a
          href="https://webring.wonderful.software#heyfirst.co"
          title="วงแหวนเว็บ"
        >
          <img
            className="h-4"
            alt="วงแหวนเว็บ"
            src="https://webring.wonderful.software/webring.black.svg"
          />
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
