import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import highlightStyles from "highlight.js/styles/base16/classic-light.css";
import Navbar from "./components/navbar";
import styles from "./styles/_generated.css";
import Fathom from "./utils/fathom";
import { description, rootUrl } from "./config";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: highlightStyles },
  ];
}

export const meta: MetaFunction = () => {
  const title = "First Sutham";
  return {
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
    title,
    description,
    keywords: "Technologies",
    "og:url": rootUrl,
    "og:title": title,
    "og:description": description,
    // "og:image": image // TODO: add og:image my photo
    // "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@heyfirst_",
    "twitter:site": "@heyfirst_",
    "twitter:title": "First Sutham",
    "twitter:description": description,
    "twitter:alt": title, // note: more about [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)
  };
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar />
        <main className="container mx-auto flex flex-col px-4">
          <Outlet />
        </main>
        <Fathom />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
