import React from "react";
import type { MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getMDXComponent } from "mdx-bundler/client";
import readingTime from "reading-time";
import { parseISO, format } from "date-fns";
import { getPostBySlug } from "~/utils/mdx.server";
import { rootUrl } from "~/config";

export const loader = async () => {
  return json(await getPostBySlug("uses"));
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data.frontmatter.title + " | First Sutham";
  return {
    charset: "utf-8",
    viewport: "width=device-width,initial-scale=1",
    title,
    description: data.frontmatter.summary,
    keywords: "Technologies",
    "og:url": rootUrl + "/blog/" + data.slug,
    "og:title": title,
    "og:description": data.frontmatter.summary,
    "og:image": rootUrl + data.frontmatter.image,
    "twitter:image": rootUrl + data.frontmatter.image,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@heyfirst_",
    "twitter:site": "@heyfirst_",
    "twitter:title": title,
    "twitter:description": data.frontmatter.summary,
    "twitter:alt": title, // note: more about [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)
  };
};

const BlogPost = () => {
  const {
    code,
    frontmatter,
    matter: { content },
  } = useLoaderData<typeof loader>();

  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <article className="mx-auto mb-8 flex w-full flex-col items-start justify-center">
      <h1 className="mb-2 text-3xl font-bold text-black md:text-4xl">
        {frontmatter.title}
      </h1>
      <div className="mb-2 flex w-full flex-row items-start justify-between text-sm text-gray-600 md:items-center">
        <div className="flex items-center italic">
          Last updated: {format(parseISO(frontmatter.date), "MMMM dd, yyyy")}
        </div>
      </div>
      <div className="mb-2 text-sm text-gray-600">
        <div className="mb-2 flex flex-row text-xs text-gray-600">
          {frontmatter.tags.sort().map((tag) => (
            <div className="mr-1 rounded-lg border px-2 py-1" key={tag}>
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div className="prose mb-8 w-full max-w-none">
        <Component />
      </div>
      <div className="w-full border-t py-4 text-xs italic text-gray-600">
        The views and opinions expressed in this article are purely mine and do
        not necessarily reflect the positions of any companies for which I have
        worked in the past, present, or future.
      </div>
      <div className="mb-8 w-full border-t pt-4">
        <giscus-widget
          repo="heyfirst/heyfirst.co"
          repoId="MDEwOlJlcG9zaXRvcnkyMjY1NjkxNTQ="
          category="General"
          categoryId="DIC_kwDODYErws4B-QE2"
          mapping="title"
          reactions-enabled="1"
          theme="light"
          crossOrigin="anonymous"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          lang="en"
          loading="lazy"
          strict="0"
          host="https://giscus.app"
        ></giscus-widget>
      </div>
    </article>
  );
};

export default BlogPost;
