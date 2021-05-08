import supabase from "@/lib/supabase";

type BlogPageViews = {
  id: number;
  slug: string;
  total_count: number;
};
export default async (req, res) => {
  const slug = req.query.slug;

  if (req.method === "POST") {
    let { data, error } = await supabase
      .from<BlogPageViews>("blog_page_views")
      .select("*")
      .eq("slug", slug);

    if (error || data.length == 0) {
      const { data } = await supabase
        .from("blog_page_views")
        .insert([{ slug, total_count: 1 }]);

      return res.status(200).json({
        total_count: data[0].total_count,
      });
    }

    const { data: updatedData } = await supabase
      .from<BlogPageViews>("blog_page_views")
      .update({ total_count: data[0].total_count + 1 })
      .eq("slug", slug);

    return res.status(200).json({
      total_count: updatedData[0].total_count,
    });
  }

  if (req.method === "GET") {
    let { data, error } = await supabase
      .from<BlogPageViews>("blog_page_views")
      .select("*")
      .eq("slug", slug);

    if (error || data.length == 0) {
      return res.status(200).json({
        total_count: 1,
      });
    }

    return res.status(200).json({ total_count: data[0].total_count });
  }
};
