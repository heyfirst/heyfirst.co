import reactQueryClient from "src/services/react-query/react-query";
import { useMutation, useQuery } from "react-query";
import numberWithCommas from "src/services/blog/utils/numberWithCommas";

const blogPageViewQueryId = (slug: string) => ["blog", "page_view", slug];

export const useBlogPageView = (slug: string) => {
  const fetcher = () =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/page_views/${slug}`).then(
      (res) => res.json()
    );

  return useQuery(blogPageViewQueryId(slug), fetcher, {
    select: (data) => numberWithCommas(data?.totalCount),
  });
};

export const useUpdateBlogPageView = (slug: string) => {
  const fetcher = () =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/page_views/${slug}`, {
      method: "POST",
    }).then((res) => res.json());

  return useMutation(fetcher, {
    onSuccess: (data) => {
      reactQueryClient.setQueryData(blogPageViewQueryId(slug), data);
    },
  });
};
