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
  url?: string;
};

const getStructuredData = (meta: Meta) => ({
  "@context": "http://schema.org",
  "@type": "Article",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": meta.url,
  },
  url: meta.url,
  image: [meta.image, meta.image, meta.image],
  publisher: {
    "@context": "http://schema.org",
    "@type": "Organization",
    name: meta.name,
    logo: {
      "@context": "http://schema.org",
      "@type": "ImageObject",
      url: "https://heyfirst.co/avatar.jpeg",
      width: "192",
      height: "192",
    },
  },
  headline: meta.title,
  author: {
    "@context": "http://schema.org",
    "@type": "Person",
    url: meta.site,
    name: meta.name,
  },
  datePublished: meta.date,
  dateModified: meta.date,
});

const Container: React.FC<React.PropsWithChildren<Meta>> = ({
  children,
  ...props
}) => {
  const router = useRouter();
  const meta = {
    title: "Kanisorn Sutham - A Developer | heyfirst.co",
    description: `Front-end developer, JavaScript enthusiast, and course creator.`,
    type: "website",
    site: "https://heyfirst.co",
    name: "Kanisorn Sutham",
    twitter_id: "@heyfirst_",
    image: "/static/kanisorn_sutham.jpg",
    tags: ["software", "tech", "developer"],
    url: `https://heyfirst.co${router.asPath}`,
    ...props,
  };

  return (
    <div className="">
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta name="keywords" content={meta.tags.join(", ")} />
        <meta property="og:url" content={meta.url} />
        <link rel="canonical" href={meta.url} />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getStructuredData(meta)),
          }}
        />
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
