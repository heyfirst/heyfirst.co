import fs from "fs";
import path from "path";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { bundleMDX } from "../../mdx.server";
import { getMDXComponent } from "mdx-bundler/client";
import { useLoaderData } from "@remix-run/react";
import React from "react";

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  const blogPath = [process.cwd(), "contents/blog"];
  const source = fs.readFileSync(path.join(...blogPath, `${slug}.mdx`), {
    encoding: "utf8",
  });

  const data = await bundleMDX({ source });
  return json(data);
};

const BlogPost = () => {
  const { code } = useLoaderData<typeof loader>();
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <div className="prose">
      <Component />
    </div>
  );
};

export default BlogPost;
