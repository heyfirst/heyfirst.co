import React from "react";
import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getMDXComponent } from "mdx-bundler/client";
import readingTime from "reading-time";
import { parseISO, format } from "date-fns";
import { getPostBySlug } from "~/utils/mdx.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;

  if (!slug) {
    return redirect("/blog");
  }

  return json(await getPostBySlug(slug));
};

const BlogPost = () => {
  const {
    code,
    frontmatter,
    matter: { content },
  } = useLoaderData<typeof loader>();

  let [isMounted, setMount] = React.useState(false);
  React.useEffect(() => {
    setMount(true);
  }, []);

  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <article className="mx-auto mb-8 flex w-full flex-col items-start justify-center">
      <div className="mb-2 flex w-full flex-row items-start justify-between text-sm text-gray-600 md:items-center">
        <div className="flex items-center">
          {format(parseISO(frontmatter.date), "MMMM dd, yyyy")}
        </div>
        <div className="md:mt-0">{readingTime(content).text}</div>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-black md:text-4xl">
        {frontmatter.title}
      </h1>
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
        {isMounted && (
          <script
            src="https://giscus.app/client.js"
            data-repo="heyfirst/heyfirst.co"
            data-repo-id="MDEwOlJlcG9zaXRvcnkyMjY1NjkxNTQ="
            data-category="General"
            data-category-id="DIC_kwDODYErws4B-QE2"
            data-mapping="title"
            data-reactions-enabled="1"
            data-theme="light"
            crossOrigin="anonymous"
            async
          />
        )}
        {/* eslint-disable-next-line tailwindcss/no-custom-classname */}
        <div className="giscus" />
      </div>
    </article>
  );
};

export default BlogPost;
