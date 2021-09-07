import numberWithCommas from "@/lib/numberWithCommas";
import { useEffect } from "react";
import { useQuery } from "react-query";
import EyeIcon from "./EyeIcon";

const PageViewCounter: React.FC<{ slug: string }> = ({ slug }) => {
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

  return (
    <span>
      {views ? numberWithCommas(views) : "———"} <EyeIcon />
    </span>
  );
};
export default PageViewCounter;
