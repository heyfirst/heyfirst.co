import { parseISO, format } from "date-fns";
import Container from "@/components/container";
import PageViewCounter from "src/services/blog/components/page-view-counter";
import Giscus from "src/services/comments/giscus";
import { FrontMatter } from "src/services/mdx";
import React from "react";
import Tag from "../../../components/tag";
import EditOnGitHub from "../../../components/edit-on-github";

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
      <article className="mx-auto mb-8 flex w-full flex-col items-start justify-center">
        <div className="mb-2 flex w-full flex-row items-start justify-between text-sm text-gray-600 md:items-center">
          <div className="flex items-center">
            {frontMatter.by}
            {format(parseISO(frontMatter.date), "MMMM dd, yyyy")}
          </div>
          <div className="min-w-32 md:mt-0">
            {frontMatter.readingTime.text} |{" "}
            <PageViewCounter slug={frontMatter.slug} shouldCount />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-black md:text-4xl">
          {frontMatter.title}
        </h1>
        <p className="mb-2 text-sm text-gray-600">
          {frontMatter.draft && (
            <span className="mr-2 inline-block cursor-not-allowed rounded-md border border-yellow-400 bg-yellow-400 px-2 py-1 italic text-white transition-all">
              draft
            </span>
          )}
          {frontMatter.tags.sort().map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </p>
        <div className="prose mb-8 w-full max-w-none">{children}</div>
        <EditOnGitHub frontMatter={frontMatter} />
        <div className="w-full border-t py-4 text-xs italic text-gray-600">
          The views and opinions expressed in this article are purely mine and
          do not necessarily reflect the positions of any companies for which I
          have worked in the past, present, or future.
        </div>
        <div className="mb-8 w-full border-t pt-4">
          <Giscus />
        </div>
      </article>
    </Container>
  );
};
export default BlogLayout;
