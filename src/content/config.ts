// 1. Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    draft: z.boolean(),
  }),
});

export const collections = {
  blog: blogCollection,
};
