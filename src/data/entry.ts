import type { EditProxy } from "emdash";

export type Entry<Data> = { id: string; data: Data; edit?: EditProxy | undefined };

export type Row<Fields> = Fields & { id: string; slug: string; status: string };

export type DbEntry<Fields> = { id: string; data: Row<Fields>; edit?: EditProxy | undefined };

export function toDate(value: string | null | undefined): Date | undefined {
	return value ? new Date(value) : undefined;
}
