import numberWithCommas from "@/lib/numberWithCommas";
import { useEffect } from "react";
import { useQuery } from "react-query";

const PageViewCounter = ({ slug }) => {
  const { data } = useQuery([`total_page_views_count`, slug], async () => {
    const res = await fetch(`/api/views/${slug}`);
    return res.json();
  });
  const views = data?.total_count;

  useEffect(() => {
    const registerView = () =>
      fetch(`/api/views/${slug}`, {
        method: "POST",
      });

    registerView();
  }, [slug]);

  return <span>{views ? numberWithCommas(views) : "———"} views</span>;
};
export default PageViewCounter;
