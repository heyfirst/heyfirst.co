import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import Footer from "./Footer";

type CustomMetaType = {
  date?: string;
  image?: string;
};

const Container: React.FC<React.PropsWithChildren<CustomMetaType>> = ({
  children,
  ...customMeta
}) => {
  const router = useRouter();
  const meta = {
    title: "Kanisorn Sutham - Developer | heyfirst.co",
    description: `Front-end developer, JavaScript enthusiast, and course creator.`,
    type: "website",
    site: "https://heyfirst.co",
    name: "Kanisorn Sutham",
    twitter_id: "@heyfirst_",
    ...customMeta,
  };

  return (
    <div className="bg-white ">
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta property="og:url" content={`${meta.site}${router.asPath}`} />
        <link rel="canonical" href={`${meta.site}${router.asPath}`} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content={meta.name} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={meta.twitter_id} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
        {meta.date && (
          <meta property="article:published_time" content={meta.date} />
        )}
      </Head>
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
            <a className="p-3 text-gray-500 transition hover:text-gray-600">
              blog
            </a>
          </NextLink>
        </div>
      </nav>
      <main className="container flex flex-col justify-center p-3 mx-auto bg-white ">
        {children}
        <Footer />
      </main>
    </div>
  );
};
export default Container;
