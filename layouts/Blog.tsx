import Script from "next/script";
import { parseISO, format } from "date-fns";

import Container from "@/components/Container";
import ConvertKitSignup from "@/components/ConvertKitSignUp";
import PageViewCounter from "@/components/PageViewCounter";
import Giscus from "@/components/Giscus";

const editUrl = (slug) =>
  `https://github.com/heyfirst/heyfirst.co/edit/main/data/blog/${slug}.mdx`;

const discussUrl = (slug) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `https://heyfirst.co/blog/${slug}`
  )}`;

export default function BlogLayout({ children, frontMatter }) {
  return (
    <Container
      title={`${frontMatter.title} | heyfirst.co`}
      description={frontMatter.summary}
      image={`https://heyfirst.co${frontMatter.image}`}
      date={new Date(frontMatter.publishedAt).toISOString()}
      type="article"
    >
      <article className="flex flex-col items-start justify-center w-full mx-auto mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-4xl">
          {frontMatter.title}
        </h1>
        <div className="flex flex-col items-start justify-between w-full mt-2 md:flex-row md:items-center">
          <div className="flex items-center">
            <img
              alt="Kanisorn Sutham"
              height={24}
              width={24}
              src="/avatar.jpeg"
              className="rounded-full"
            />
            <p className="ml-2 text-sm text-gray-700">
              {frontMatter.by}
              {"Kanisorn Sutham | "}
              {format(parseISO(frontMatter.publishedAt), "MMMM dd, yyyy")}
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-500 min-w-32 md:mt-0">
            {frontMatter.readingTime.text} |{" "}
            <PageViewCounter slug={frontMatter.slug} />
          </p>
        </div>
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
}
