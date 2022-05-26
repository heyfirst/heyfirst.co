import Link from "next/link";
import React from "react";

const ExternalLink: React.FC<React.PropsWithChildren<{ href: string }>> = ({
  href,
  children,
}) => (
  <a
    className="text-gray-600 transition hover:text-gray-600"
    target="_blank"
    rel="noopener noreferrer"
    href={href}
  >
    {children}
  </a>
);

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col items-start justify-center w-full mx-auto mb-8">
      <hr className="w-full mb-8 border-gray-200 border-1 " />
      <div className="grid w-full grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
        <div className="flex flex-col space-y-4">
          <Link href="/">
            <a className="text-gray-600 transition hover:text-gray-600">Home</a>
          </Link>
          <Link href="/about">
            <a className="text-gray-600 transition hover:text-gray-600">
              About
            </a>
          </Link>
          <Link href="/blog">
            <a className="text-gray-600 transition hover:text-gray-600">Blog</a>
          </Link>
        </div>
        <div className="flex flex-col space-y-4">
          <ExternalLink href="https://twitter.com/heyfirst_">
            Twitter
          </ExternalLink>
          <ExternalLink href="https://github.com/heyfirst">GitHub</ExternalLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
