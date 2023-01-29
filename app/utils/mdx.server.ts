import fs from "fs";
import path from "path";
import { bundleMDX } from "mdx-bundler";
import remarkMdxImages from "remark-mdx-images";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";

interface IFrontmatter {
  title: string;
  description: string;
  date: string;
  slug: string;
  tags: string[];
  draft: boolean;
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

      // TODO(markdown): add this https://github.com/rehypejs/rehype-autolink-headings and custom styles too
      options.rehypePlugins = [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            content: {
              type: "element",
              tagName: "a",
              properties: {
                className: ["anchor-link no-underline"],
              },
              children: [],
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
      const { frontmatter } = await getMDX(folder, source);
      return {
        title: frontmatter.title,
        slug: folder,
        draft: frontmatter.draft,
      };
    })
  );

  return blogposts.filter((post) => !post.draft).reverse();
};

export const getPostBySlug = async (slug: string) => {
  const source = getMDXRawFileByFolder(slug);
  const data = await getMDX(slug, source);
  return data;
};
