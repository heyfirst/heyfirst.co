import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import readingTime from "reading-time";
import { parseISO, format } from "date-fns";
import { getAllPosts } from "~/utils/mdx.server";

export async function loader() {
  return json(await getAllPosts());
}

const BlogList = () => {
  const posts = useLoaderData<typeof loader>();

  // TODO: Add search
  // const fuse = new Fuse(posts, options);
  // const result = fuse.search(searchStr);
  // const filteredPosts =
  //   searchStr === "" ? posts : result.map((post) => post.item);

  return (
    <div className="mx-auto mb-8 max-w-2xl">
      <h1 className="mb-4 text-3xl font-bold text-black md:text-5xl">Blog</h1>
      <p className="prose mb-4 text-gray-600">
        I am writing about my life journey, technology & tools, web development,
        and software engineering practice I believe.
      </p>
      <p className="prose mb-4 text-gray-600">
        I have my old blog on{" "}
        <a
          href="https://medium.com/ks-journals"
          target="_blank"
          rel="noopener noreferrer"
        >
          Medium
        </a>{" "}
        and I decided to move to my personal website because I can deliver a
        better experience. {`I've written`} <u>{posts.length}</u> articles on
        this site.
      </p>
      {/* <hr className="my-4" /> */}
      {/* // TODO: Add filter by tags */}
      {/* <div className="my-4 text-center text-xs text-gray-600">
        <Tag
          className={search === "" ? "border-yellow-700 text-yellow-700" : ""}
          enableHover
          onClick={() => onClickTag("")}
        >
          all blogs
        </Tag>
        {tags.sort().map((tag) => (
          <Tag
            key={tag}
            enableHover
            className={
              search === tag ? "border-yellow-700 text-yellow-700" : ""
            }
            onClick={() => onClickTag(tag)}
          >
            {tag}
          </Tag>
        ))}
      </div> */}
      <hr className="my-4" />
      <div className="mb-4 w-full">
        {posts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`}>
            <div className="group relative mb-4 cursor-pointer bg-white">
              <div className="flex justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  {format(parseISO(post.date), "MMMM dd, yyyy")}
                </div>
                <div className="md:mt-0">{readingTime(post.content).text}</div>
              </div>
              <div className="flex flex-col justify-between md:flex-row">
                <h2 className="w-full text-base font-medium text-gray-900 group-hover:underline md:text-xl">
                  {post.title}
                </h2>
              </div>
              <div className="mb-2 flex flex-row text-xs text-gray-600">
                {post.tags.sort().map((tag) => (
                  <div className="mr-1 rounded-lg border px-2 py-1" key={tag}>
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
