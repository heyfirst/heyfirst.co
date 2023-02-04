import fs from "fs";
import path from "path";
import { bundleMDX } from "mdx-bundler";
import remarkMdxImages from "remark-mdx-images";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import frontmatter from "gray-matter";

interface IFrontmatter {
  title: string;
  summary: string;
  date: string;
  tags: string[];
  image: string;
  // meta
  content: string;
  slug: string;
}

const blogPath = [process.cwd(), "contents/blog"];

const getMDXRawFileByFolder = (folder: string) =>
  fs.readFileSync(path.join(...blogPath, folder, "index.mdx"), {
    encoding: "utf8",
  });

export const getMDX = async (folder: string, source: string) => {
  const mdx = await bundleMDX<IFrontmatter>({
    source,
    cwd: path.join(...blogPath, folder),
    mdxOptions: (options) => {
      // TODO: add @codesandbox/sandpack to mdx
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkMdxImages,
        remarkGfm,
      ];

      options.rehypePlugins = [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            properties: {
              className: [
                "no-underline absolute -ml-8 anchor opacity-0 transition ",
              ],
            },
            content: {
              type: "element",
              tagName: "span",
              children: [{ type: "text", value: "🔗" }],
            },
          },
        ],
        [rehypeHighlight, {}],
      ];
      return options;
    },
    esbuildOptions: (options) => {
      options.outdir = path.resolve("public/build/_assets"); // Set the `outdir` to a public location for this bundle.
      options.loader = {
        ...options.loader,
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
      };
      options.publicPath = path.join("/build/_assets"); // Set the public path to /img/about
      options.write = true; // Set write to true so that esbuild will output the files.
      return options;
    },
  });
  return mdx;
};

export const getAllPosts = async () => {
  const folderlist = fs.readdirSync(path.join(...blogPath));

  const blogposts = await Promise.all(
    folderlist.map(async (folder) => {
      const source = getMDXRawFileByFolder(folder);

      // TODO move images in public folder to contetns/blog folder
      const { content, data } = frontmatter(source);
      return {
        ...data,
        content,
        slug: folder,
      } as IFrontmatter;
    })
  );

  const sortedBlogposts = blogposts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedBlogposts;
};

export const getPostBySlug = async (slug: string) => {
  const source = getMDXRawFileByFolder(slug);
  const data = await getMDX(slug, source);
  return { ...data, slug };
};
