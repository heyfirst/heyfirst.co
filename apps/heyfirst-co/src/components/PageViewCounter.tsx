import numberWithCommas from "src/lib/numberWithCommas";
import { useEffect } from "react";
import { useQuery } from "react-query";
import EyeIcon from "./EyeIcon";

const PageViewCounter: React.FC<{ slug: string }> = ({ slug }) => {
  const { data } = useQuery([`total_page_views_count`, slug], async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog/page_views/${slug}`
    );
    return res.json();
  });
  const views = data?.totalCount;

  useEffect(() => {
    const registerView = () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/page_views/${slug}`, {
        method: "POST",
      });

    registerView();
  }, [slug]);

  return (
    <span>
      {views ? numberWithCommas(views) : "———"} <EyeIcon />
    </span>
  );
};
export default PageViewCounter;
