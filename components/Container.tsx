import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

type Meta = {
  title?: string;
  description?: string;
  type?: string;
  site?: string;
  name?: string;
  twitter_id?: string;
  date?: string;
  image?: string;
  tags?: string[];
};

const Container: React.FC<React.PropsWithChildren<Meta>> = ({
  children,
  ...props
}) => {
  const router = useRouter();
  const meta: Meta = {
    title: "Kanisorn Sutham - A Developer | heyfirst.co",
    description: `Front-end developer, JavaScript enthusiast, and course creator.`,
    type: "website",
    site: "https://heyfirst.co",
    name: "Kanisorn Sutham",
    twitter_id: "@heyfirst_",
    image: "/static/kanisorn_sutham.jpg",
    tags: ["software", "tech", "developer"],
    ...props,
  };

  return (
    <div className="">
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta name="keywords" content={meta.tags.join(", ")} />
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
      <Navbar />
      <main className="container flex flex-col justify-center p-3 mx-auto ">
        {children}
        <Footer />
      </main>
    </div>
  );
};
export default Container;
