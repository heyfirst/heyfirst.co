export type Paged<T> = {
	data: T[];
	url: { prev: string | undefined; next: string | undefined };
};

const PAGE_SIZE = 10;

export function paginate<T>(items: T[], pageNumber: number, base: string): Paged<T> | null {
	const lastPage = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
	if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > lastPage) return null;
	const urlOf = (n: number) => (n === 1 ? base : `${base}${n}`);
	return {
		data: items.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE),
		url: {
			prev: pageNumber > 1 ? urlOf(pageNumber - 1) : undefined,
			next: pageNumber < lastPage ? urlOf(pageNumber + 1) : undefined,
		},
	};
}

export function parsePageNumber(param: string | undefined): number {
	return param ? Number(param) : 1;
}
