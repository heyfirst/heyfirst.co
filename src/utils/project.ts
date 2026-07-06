import type { CollectionEntry } from "astro:content";

export const projectStatusColor: Record<CollectionEntry<"project">["data"]["status"], string> = {
	Live: "bg-leaf",
	Active: "bg-olive",
	Maintained: "bg-tag-career",
};

export function sortProjectsByOrder(projects: CollectionEntry<"project">[]) {
	return projects.sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity));
}
