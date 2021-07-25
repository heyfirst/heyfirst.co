import Image from "next/image";
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
      date={new Date(frontMatter.date).toISOString()}
      type="article"
    >
      <article className="flex flex-col items-start justify-center w-full mx-auto mb-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-black md:text-4xl">
          {frontMatter.title}
        </h1>
        <p className="mb-4 text-sm text-gray-500">
          {frontMatter.tags.sort().map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 mr-2 transition-all border rounded-md cursor-not-allowed hover:text-yellow-700 hover:border-yellow-700"
            >
              {tag}
            </span>
          ))}
        </p>
        <div className="flex flex-col items-start justify-between w-full md:flex-row md:items-center">
          <div className="flex items-center mb-2">
            <Image
              alt="Kanisorn Sutham"
              height={24}
              width={24}
              src="/avatar.jpeg"
              className="rounded-full"
            />
            <p className="ml-2 text-sm text-gray-700">
              {frontMatter.by}
              {"Kanisorn Sutham | "}
              {format(parseISO(frontMatter.date), "MMMM dd, yyyy")}
            </p>
          </div>
          <p className="text-sm text-gray-500 min-w-32 md:mt-0">
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
