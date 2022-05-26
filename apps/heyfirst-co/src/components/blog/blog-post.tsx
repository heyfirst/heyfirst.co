import { FrontMatter } from "src/lib/mdx";
import numberWithCommas from "src/lib/numberWithCommas";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useQuery } from "react-query";
import EyeIcon from "../counter/eye-icon";

const BlogPost: React.FC<FrontMatter> = ({ title, slug, date, tags }) => {
  const { data } = useQuery([`total_page_views_count`, slug], async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog/page_views/${slug}`
    );
    return res.json();
  });
  const views = data?.totalCount;
  const viewsCount = `${views ? numberWithCommas(views) : "———"}`;

  const readableDate = format(parseISO(date), "MMMM dd, yyyy");
  return (
    <Link href={`/blog/${slug}`} passHref>
      <a href={`/blog/${slug}`}>
        <div className="relative mb-4 bg-white cursor-pointer z-100 group">
          <div className="flex justify-between text-xs text-gray-600">
            <div>{readableDate}</div>
            <div>
              {viewsCount} <EyeIcon />
            </div>
          </div>
          <div className="flex flex-col justify-between md:flex-row">
            <h2 className="w-full text-base font-medium text-gray-900 md:text-xl group-hover:underline">
              {title}
            </h2>
          </div>
          <div className="hidden mb-2 text-xs text-gray-600 md:block">
            {tags.sort().map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 mr-2 transition-all border rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </a>
    </Link>
  );
};

export default BlogPost;