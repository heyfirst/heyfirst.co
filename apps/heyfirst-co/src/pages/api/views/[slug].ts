import supabase from "src/lib/supabase";
import { NextApiRequest, NextApiResponse } from "next";

interface BlogPageViewsTable {
  id: number;
  slug: string;
  total_count: number;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const slug = req.query.slug as string;

  if (req.method === "POST") {
    const { data, error } = await supabase
      .from<BlogPageViewsTable>("blog_page_views")
      .select("*")
      .eq("slug", slug);

    if (error || data.length === 0) {
      const { data } = await supabase
        .from("blog_page_views")
        .insert([{ slug, total_count: 1 }]);

      return res.status(200).json({
        totalCount: data[0].total_count,
      });
    }

    const { data: updatedData } = await supabase
      .from<BlogPageViewsTable>("blog_page_views")
      .update({ total_count: data[0].total_count + 1 })
      .eq("slug", slug);

    return res.status(200).json({
      totalCount: updatedData[0].total_count,
    });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase
      .from<BlogPageViewsTable>("blog_page_views")
      .select("*")
      .eq("slug", slug);

    if (error || data.length === 0) {
      return res.status(200).json({
        total_count: 1,
      });
    }

    return res.status(200).json({ totalCount: data[0].total_count });
  }
};

export default handler;
