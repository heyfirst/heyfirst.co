import { NextSeo } from "next-seo";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Footer from "./footer";
import Navbar from "./navbar";

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
    <>
      <NextSeo
        title={meta.title}
        description={meta.description}
        canonical={meta.url}
        openGraph={{
          url: meta.url,
          title: meta.title,
          description: meta.description,
          images: [
            {
              url: meta.image,
              alt: `meta.title Alt`,
            },
          ],
          site_name: meta.name,
          type: "article",
          article: {
            publishedTime: meta.date,
            tags: meta.tags,
          },
        }}
        twitter={{
          handle: meta.twitter_id,
          site: meta.twitter_id,
          cardType: "summary_large_image",
        }}
        additionalLinkTags={[
          {
            rel: "manifest",
            href: "/static/favicon/site.webmanifest",
          },
          {
            rel: "apple-touch-icon",
            type: "image/png",
            sizes: "180x180",
            href: "/static/favicon/apple-touch-icon.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/static/favicon/favicon-32x32.png",
          },
          {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/static/favicon/favicon-16x16.png",
          },
        ]}
        additionalMetaTags={[
          {
            name: "keywords",
            content: meta.tags.join(", ") || "",
          },
          {
            name: "theme-color",
            content: "#ffffff",
          },
          {
            name: "msapplication-TileColor",
            content: "#ffffff",
          },
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
          },
          {
            httpEquiv: "content-type",
            content: "text/html; charset=UTF-8",
          },
        ]}
      />
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getStructuredData(meta)),
          }}
        />
      </Head>
      <Navbar />
      <main className="container mx-auto flex flex-col justify-center p-3 pt-0 ">
        {children}
        <Footer />
      </main>
    </>
  );
};
export default Container;
