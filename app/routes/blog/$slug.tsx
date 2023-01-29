import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getPostBySlug } from "~/utils/mdx.server";
import { getMDXComponent } from "mdx-bundler/client";
import { useLoaderData } from "@remix-run/react";
import React from "react";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;

  if (!slug) {
    return redirect("/blog");
  }

  return json(await getPostBySlug(slug));
};

const BlogPost = () => {
  const { code, frontmatter } = useLoaderData<typeof loader>();
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <article className="mx-auto mb-8 flex w-full flex-col items-start justify-center">
      <div className="mb-2 flex w-full flex-row items-start justify-between text-sm text-gray-600 md:items-center">
        <div className="flex items-center">
          {/* // TODO: Add date */}
          {/* {format(parseISO(frontMatter.date), "MMMM dd, yyyy")} */}
        </div>
        <div className="md:mt-0">
          {/* // TODO: Add readingTime */}
          {/* {frontMatter.readingTime.text} |{" "}
          <PageViewCounter slug={frontMatter.slug} shouldCount /> */}
        </div>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-black md:text-4xl">
        {frontmatter.title}
      </h1>
      <div className="mb-2 text-sm text-gray-600">
        {frontmatter.draft && (
          <span className="mr-2 inline-block cursor-not-allowed rounded-md border border-yellow-400 bg-yellow-400 px-2 py-1 italic text-white transition-all">
            draft
          </span>
        )}
        {frontmatter.tags.map((tag) => (
          <div key={tag}>{tag}</div>
        ))}
      </div>
      <div className="prose mb-8 w-full max-w-none">
        <Component />
      </div>
      {/* // TODO: Add tags */}
      {/* <EditOnGitHub frontMatter={frontMatter} /> */}
      <div className="w-full border-t py-4 text-xs italic text-gray-600">
        The views and opinions expressed in this article are purely mine and do
        not necessarily reflect the positions of any companies for which I have
        worked in the past, present, or future.
      </div>
      <div className="mb-8 w-full border-t pt-4">
        {/* // TODO: Add comments */}
        {/* <Giscus /> */}
      </div>
    </article>
  );
};

export default BlogPost;
