import { goto } from '$app/navigation';
import { page } from '$app/state';

/** View state lives in the URL: shareable, survives a reload, and never re-runs the project load. */
export const setParams = (params: Record<string, string | null>) =>
	goto(hrefWith(params), { replaceState: true, noScroll: true, keepFocus: true });

export const param = (key: string) => page.url.searchParams.get(key);

export function hrefWith(params: Record<string, string | null>) {
	const url = new URL(page.url);
	for (const [key, value] of Object.entries(params))
		if (value === null) url.searchParams.delete(key);
		else url.searchParams.set(key, value);
	return `${url.pathname}${url.search}`;
}
