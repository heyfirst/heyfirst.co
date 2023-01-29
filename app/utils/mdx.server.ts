import fs from "fs";
import path from "path";
import { bundleMDX } from "mdx-bundler";
import remarkMdxImages from "remark-mdx-images";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
      ];
      return options;
    },
    esbuildOptions: (options) => {
      // Set the `outdir` to a public location for this bundle.
      options.outdir = path.resolve("public/build/_assets");
      options.loader = {
        ...options.loader,
        ".png": "file",
        ".jpg": "file",
        ".jpeg": "file",
      };
      // Set the public path to /img/about
      options.publicPath = path.join("/build/_assets");

      // Set write to true so that esbuild will output the files.
      options.write = true;
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
