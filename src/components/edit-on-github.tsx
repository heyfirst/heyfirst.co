import React from "react";
import { FrontMatter } from "src/services/mdx";

const editUrl = (slug: string) =>
  `https://github.com/heyfirst/heyfirst.co/edit/main/apps/heyfirst-co/content/blog/${slug}.mdx`;

const tweetThis = (title: string, slug) => {
  const tweetText = `"${title}" by @heyfirst_ – https://heyfirst.co/blog/${slug}`;
  const text = encodeURIComponent(tweetText);
  return `https://twitter.com/intent/tweet?text=${text}`;
};

const EditOnGitHub: React.FC<{ frontMatter: FrontMatter }> = ({
  frontMatter,
}) => {
  return (
    <div className="mb-4 text-sm text-gray-600">
      <a
        href={tweetThis(frontMatter.title, frontMatter.slug)}
        target="_blank"
        rel="noopener noreferrer"
      >
        {"Tweet this"}
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
  );
};

export default EditOnGitHub;
