import type { Project } from "@/data/project";

export const projectStatusColor: Record<Project["data"]["status"], string> = {
	Live: "bg-leaf",
	Active: "bg-olive",
	Maintained: "bg-tag-career",
};

export function sortProjectsByOrder(projects: Project[]) {
	return projects.sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity));
}
