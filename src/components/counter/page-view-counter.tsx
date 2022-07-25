import { useEffect } from "react";
import { useBlogPageView, useUpdateBlogPageView } from "src/entities/blog";
import EyeIcon from "../icon/eye-icon";

type Props = { slug: string; shouldCount?: boolean };

const PageViewCounter: React.FC<Props> = ({ slug, shouldCount = false }) => {
  const { data: viewsCount } = useBlogPageView(slug);
  const { mutate: updateBlogPageView } = useUpdateBlogPageView(slug);

  useEffect(() => {
    if (shouldCount) {
      updateBlogPageView();
    }
  }, [shouldCount, updateBlogPageView]);

  return (
    <span>
      {viewsCount || "———"} <EyeIcon />
    </span>
  );
};
export default PageViewCounter;
