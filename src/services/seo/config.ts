import { DefaultSeoProps } from "next-seo";

const isProd = process.env.NODE_ENV === "production";

export const baseUrl = isProd ? "https://heyfirst.co" : "";
export const baseEmail = "kanisorns.k@gmail.com";

export const defaultSEO: DefaultSeoProps = {
  title: "First Sutham",
  description:
    "Software engineer, TypeScript enthusiast, writer, living in Helsinki, Finland",
  openGraph: {
    type: "website",
    locale: "en_FI",
    url: baseUrl,
    site_name: "First Sutham",
    images: [
      {
        url: `${baseUrl}/static/kanisorn_sutham.jpg`,
        alt: "First Sutham",
      },
    ],
  },
  twitter: {
    handle: "@heyfirst_",
    site: "@heyfirst_",
    cardType: "summary_large_image",
  },
  additionalLinkTags: [
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
    {
      rel: "alternate",
      type: "application/rss+xml",
      href: `${baseUrl}/rss.xml`,
    },
  ],
  additionalMetaTags: [
    {
      name: "theme-color",
      content: "#ffffff",
    },
    {
      name: "msapplication-TileColor",
      content: "#ffffff",
    },
  ],
};

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function extendSEO(options: SEOProps) {
  const images = options.image
    ? [{ url: `${baseUrl}/static/${options.image}` }]
    : defaultSEO.openGraph.images;

  return {
    ...defaultSEO,
    ...options,
    url: `${baseUrl}/${options.url}`,
    openGraph: {
      ...defaultSEO.openGraph,
      images,
      url: `${baseUrl}/${options.url}`,
    },
  };
}
