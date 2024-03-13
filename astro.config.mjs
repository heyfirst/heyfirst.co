import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import { selectAll } from "hast-util-select";
import remarkCodeTitles from "remark-code-titles";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeToc from "rehype-toc";

const adder = ([selector, className]) => {
  const writer = write(className);
  return (node) => selectAll(selector, node).forEach(writer);
};

const write =
  (className) =>
  ({ properties }) => {
    if (!properties.className) properties.className = className;
    else properties.className += ` ${className}`;
  };

const addClasses = (additions) => {
  const adders = Object.entries(additions).map(adder);
  return (node) => adders.forEach((a) => a(node));
};

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkCodeTitles],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "prepend" }],
        // [rehypeToc, { headings: ["h2", "h3"] }], // TODO: only add toc when I define [[toc]] in the markdown
        [addClasses, { "h1,h2,h3": "title" }],
      ],
    }),
    tailwind(),
    svelte(),
  ],
});
