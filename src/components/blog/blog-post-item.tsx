import { FrontMatter } from "src/lib/mdx";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import Tag from "src/components/core/tag";
import PageViewCounter from "../counter/page-view-counter";

const BlogPost: React.FC<FrontMatter> = ({ title, slug, date, tags }) => {
  const readableDate = format(parseISO(date), "MMMM dd, yyyy");

  return (
    <Link href={`/blog/${slug}`} passHref>
      <a href={`/blog/${slug}`}>
        <div className="z-100 group relative mb-4 cursor-pointer bg-white">
          <div className="flex justify-between text-xs text-gray-600">
            <div>{readableDate}</div>
            <div>
              <PageViewCounter slug={slug} />
            </div>
          </div>
          <div className="flex flex-col justify-between md:flex-row">
            <h2 className="w-full text-base font-medium text-gray-900 group-hover:underline md:text-xl">
              {title}
            </h2>
          </div>
          <div className="mb-2 hidden text-xs text-gray-600 md:block">
            {tags.sort().map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default BlogPost;
