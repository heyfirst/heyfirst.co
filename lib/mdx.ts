import fs from "fs";
import matter from "gray-matter";
import mdxPrism from "mdx-prism";
import path from "path";
import readingTime from "reading-time";
import renderToString from "next-mdx-remote/render-to-string";

import MDXComponents from "@/components/MDXComponents";
import { MdxRemote } from "next-mdx-remote/types";

const root = process.cwd();

type FileType = "blog" | "book" | "index" | "about";

export interface FrontMatter {
  wordCount: number;
  readingTime: { text: string; time: number; words: number; minutes: number };
  slug: string | null;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  image: string;
  by: string;
}
export interface MDXFile {
  mdxSource: MdxRemote.Source;
  frontMatter: FrontMatter;
}

export async function getFiles(type: FileType): Promise<string[]> {
  return fs.readdirSync(path.join(root, "data", type));
}

export async function getFileBySlug(
  type: FileType,
  slug?: string
): Promise<MDXFile> {
  const source = slug
    ? fs.readFileSync(path.join(root, "data", type, `${slug}.mdx`), "utf8")
    : fs.readFileSync(path.join(root, "data", `${type}.mdx`), "utf8");

  const { data, content } = matter(source);
  const mdxSource = await renderToString(content, {
    components: MDXComponents,
    mdxOptions: {
      remarkPlugins: [
        require("remark-autolink-headings"),
        require("remark-slug"),
        require("remark-code-titles"),
      ],
      rehypePlugins: [mdxPrism],
    },
  });

  return {
    mdxSource,
    frontMatter: {
      title: data.title || "",
      summary: data.summary || "",
      image: data.image || "",
      date: data.date || "",
      tags: data.tags || [],
      by: data.by || "",
      wordCount: content.split(/\s+/gu).length,
      readingTime: readingTime(content),
      slug: slug || null,
    },
  };
}

export type FilesFrontMatter = [FrontMatter[], string[]];

export async function getAllFilesFrontMatter(
  type: FileType
): Promise<FilesFrontMatter> {
  const files = await getFiles(type);

  const tags = new Set<string>();

  const posts = files
    .reduce((allPosts, postSlug) => {
      const source = fs.readFileSync(
        path.join(root, "data", type, postSlug),
        "utf8"
      );
      const { data } = matter(source);

      data.tags.forEach((tag) => tags.add(tag));

      return [
        {
          ...data,
          slug: postSlug.replace(".mdx", ""),
        },
        ...allPosts,
      ];
    }, [])
    .sort((a, b) => b.date.localeCompare(a.date));

  return [posts, Array.from(tags)];
}
