import { parseISO, format } from "date-fns";
import Container from "@/components/core/container";
import ConvertKitSignup from "@/components/core/convert-kit-sign-up";
import PageViewCounter from "@/components/counter/page-view-counter";
import Giscus from "@/components/core/giscus";
import { FrontMatter } from "src/lib/mdx";
import React from "react";
import Tag from "../core/tag";

const editUrl = (slug: string) =>
  `https://github.com/heyfirst/heyfirst.co/edit/main/apps/heyfirst-co/content/blog/${slug}.mdx`;

const discussUrl = (title: string) => {
  const text = encodeURIComponent(title);
  return `https://mobile.twitter.com/search?q=${text}&src=typed_query&f=live`;
};

const BlogLayout: React.FC<
  React.PropsWithChildren<{ frontMatter: FrontMatter }>
> = ({ children, frontMatter }) => {
  return (
    <Container
      title={`${frontMatter.title} | heyfirst.co`}
      description={frontMatter.summary}
      image={`https://heyfirst.co${frontMatter.image}`}
      date={new Date(frontMatter.date).toISOString()}
      type="article"
      tags={frontMatter.tags}
    >
      <article className="flex flex-col items-start justify-center w-full mx-auto mb-8">
        <div className="flex flex-row items-start justify-between w-full mb-2 text-sm text-gray-600 md:items-center">
          <div className="flex items-center">
            {frontMatter.by}
            {format(parseISO(frontMatter.date), "MMMM dd, yyyy")}
          </div>
          <div className="min-w-32 md:mt-0">
            {frontMatter.readingTime.text} |{" "}
            <PageViewCounter slug={frontMatter.slug} shouldCount />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-black md:text-4xl">
          {frontMatter.title}
        </h1>
        <p className="mb-2 text-sm text-gray-600">
          {frontMatter.draft && (
            <span className="inline-block px-2 py-1 mr-2 italic text-white transition-all bg-yellow-400 border border-yellow-400 rounded-md cursor-not-allowed">
              draft
            </span>
          )}
          {frontMatter.tags.sort().map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </p>
        <div className="w-full mb-8 prose max-w-none">{children}</div>
        <div className="mb-4 text-sm text-gray-600">
          <a
            href={discussUrl(frontMatter.title)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {"Discuss on Twitter"}
          </a>
          {` | `}
          <a
            href={editUrl(frontMatter.slug)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {"Edit on GitHub"}
          </a>
        </div>
        <div className="w-full pt-4 mb-8 border-t">
          <Giscus />
        </div>
        <div className="w-full pt-4 mb-8 text-xs italic text-gray-600 border-t">
          The views and opinions expressed in this article are purely mine and
          do not necessarily reflect the positions of any companies for which I
          have worked in the past, present, or future.
        </div>
        <ConvertKitSignup />
      </article>
    </Container>
  );
};
export default BlogLayout;
