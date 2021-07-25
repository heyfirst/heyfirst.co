import numberWithCommas from "@/lib/numberWithCommas";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useQuery } from "react-query";

interface IBlogPost {
  title: string;
  slug: string;
  date: string;
  tags: string[];
}

const BlogPost: React.FC<IBlogPost> = ({ title, slug, date, tags }) => {
  const { data } = useQuery([`total_page_views_count`, slug], async () => {
    const res = await fetch(`/api/views/${slug}`);
    return res.json();
  });
  const views = data?.total_count;
  const viewsCount = `${views ? numberWithCommas(views) : "———"} views`;

  const readableDate = format(parseISO(date), "MMMM dd, yyyy");
  return (
    <Link href={`/blog/${slug}`}>
      <div className="relative mb-4 bg-white cursor-pointer z-100 group">
        <div className="flex flex-col justify-between md:flex-row">
          <a className="relative w-full transition hover:text-yellow-700">
            <h4 className="w-full text-lg font-medium text-gray-900 md:text-xl group-hover:underline">
              {title}
            </h4>
          </a>
        </div>
        <div className="text-sm text-gray-600">
          {tags.sort().map((tag, i, arr) => {
            const comma = i < arr.length - 1 ? ", " : "";
            return (
              <span key={tag} className="hover:text-yellow-700">
                {tag}
                {comma}
              </span>
            );
          })}
          {` — `}
          {readableDate}
          {` — `}
          {viewsCount}
        </div>
        <div className="flex tags"></div>
      </div>
    </Link>
  );
};

export default BlogPost;
