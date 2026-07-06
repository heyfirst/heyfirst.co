import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const baseSchema = z.object({
	title: z.string().max(60),
});

const post = defineCollection({
	loader: glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			// TODO(substack): implement substack backlinks
			substackLink: z.string().optional(),
		}),
});

const snippet = defineCollection({
	loader: glob({ base: "./src/content/snippet", pattern: "**/*.{md,mdx}" }),
	schema: baseSchema.extend({
		description: z.string().optional(),
		// Powers the language badge on the homepage Snippets cards (e.g. "ts", "sql"). Optional
		// since older entries predate the field; the badge is simply omitted when absent.
		lang: z.string().optional(),
		publishDate: z.iso
			.datetime({ offset: true }) // Ensures ISO 8601 format with offsets allowed (e.g. "2024-01-01T00:00:00Z" and "2024-01-01T00:00:00+02:00")
			.transform((val) => new Date(val)),
	}),
});

const project = defineCollection({
	loader: glob({ base: "./src/content/project", pattern: "**/*.{md,mdx}" }),
	// Deliberately doesn't extend baseSchema: projects are named entities (`name`), not
	// written pieces with a `title`, so the two schemas aren't meant to converge.
	schema: z.object({
		name: z.string(),
		stack: z.string(),
		description: z.string(),
		status: z.enum(["Live", "Active", "Maintained"]),
		url: z.string().optional(),
		order: z.number().optional(),
	}),
});

export const collections = { post, snippet, project };
