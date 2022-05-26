import { parseISO, format } from "date-fns";
import Container from "src/components/Container";
import ConvertKitSignup from "src/components/ConvertKitSignUp";
import PageViewCounter from "src/components/PageViewCounter";
import Giscus from "src/components/Giscus";
import { FrontMatter } from "src/lib/mdx";
import React from "react";

const editUrl = (slug) =>
  `https://github.com/heyfirst/heyfirst.co/edit/main/content/blog/${slug}.mdx`;

const discussUrl = (slug) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `https://heyfirst.co/blog/${slug}`
  )}`;

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
        <div className="flex flex-row items-start justify-between w-full mb-2 text-sm text-gray-700 md:items-center">
          <div className="flex items-center">
            {frontMatter.by}
            {format(parseISO(frontMatter.date), "MMMM dd, yyyy")}
          </div>
          <div className="min-w-32 md:mt-0">
            {frontMatter.readingTime.text} |{" "}
            <PageViewCounter slug={frontMatter.slug} />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-black md:text-4xl">
          {frontMatter.title}
        </h1>
        <p className="mb-2 text-sm text-gray-500">
          {frontMatter.tags.sort().map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-1 mr-2 transition-all border rounded-md cursor-not-allowed hover:text-yellow-700 hover:border-yellow-700"
            >
              {tag}
            </span>
          ))}
        </p>

        <div className="w-full mb-8 prose max-w-none">{children}</div>
        <div className="w-full pt-4 mb-8 border-t">
          <Giscus />
        </div>
        <ConvertKitSignup />
        <div className="mt-8 text-sm text-gray-700">
          <a
            href={discussUrl(frontMatter.slug)}
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
      </article>
    </Container>
  );
};
export default BlogLayout;
