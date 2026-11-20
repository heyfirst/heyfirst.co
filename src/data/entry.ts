import type { ImageValue } from "emdash";

export type Entry<Data> = { id: string; data: Data };

export type Row<Fields> = Fields & { id: string; slug: string; status: string };

export type DbEntry<Fields> = { id: string; data: Row<Fields> };

export type ContentImage = ImageValue;

export function toDate(value: string | null | undefined): Date | undefined {
	return value ? new Date(value) : undefined;
}
