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
    <footer className="mx-auto my-8 flex w-full flex-col items-start justify-center">
      <hr className="border-1 mb-8 w-full border-gray-200 " />
      <div className="grid w-full grid-cols-2 gap-4 pb-16 sm:grid-cols-3">
        <div className="flex flex-col space-y-4">
          <Link href="/" className="text-gray-600 transition hover:text-gray-600">
            Home
          </Link>
          <Link href="/about" className="text-gray-600 transition hover:text-gray-600">
            
              About
            
          </Link>
          <Link href="/blog" className="text-gray-600 transition hover:text-gray-600">
            Blog
          </Link>
          <Link href="/uses" className="text-gray-600 transition hover:text-gray-600">
            
              /uses
            
          </Link>
        </div>
        <div className="flex flex-col space-y-4">
          <ExternalLink href="https://twitter.com/heyfirst_">
            Twitter
          </ExternalLink>
          <ExternalLink href="https://github.com/heyfirst">GitHub</ExternalLink>
          <ExternalLink href="https://www.strava.com/athletes/heyfirst">
            Strava 🏃
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
