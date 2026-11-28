import { getEmDashCollection } from "emdash";
import type { Entry, Row } from "./entry";

type ProjectFields = {
	name: string;
	stack: string;
	description: string;
	project_status: ProjectStatus;
	url?: string | null;
	sort_order?: number | null;
};

type ProjectStatus = "Live" | "Active" | "Maintained";

type ProjectData = {
	name: string;
	stack: string;
	description: string;
	status: ProjectStatus;
	url: string | undefined;
	order: number | undefined;
};

export type Project = Entry<ProjectData>;

export async function getAllProjects(): Promise<Project[]> {
	const { entries, error } = await getEmDashCollection<"project", Row<ProjectFields>>("project", {
		status: "published",
	});
	if (error) throw error;
	return entries.map(({ id, data }) => ({
		id,
		data: {
			name: data.name,
			stack: data.stack,
			description: data.description,
			status: data.project_status,
			url: data.url || undefined,
			order: data.sort_order ?? undefined,
		},
	}));
}
