import { goto } from '$app/navigation';
import { page } from '$app/state';
import { toasts } from '$lib/client/toasts.svelte';

/** Confirms a creation with a way to open what was made. */
export function created(element: { ref: string; kind: string } | undefined, message: string) {
	if (!element) return;
	const slug = page.params.slug;
	const open = () => {
		if (element.kind === 'feature') return goto(`/p/${slug}/features/${element.ref}`);
		const url = new URL(page.url);
		url.searchParams.set('peek', element.ref);
		return goto(url, { noScroll: true, keepFocus: true });
	};
	toasts.show(`${element.ref} · ${message}`, 'success', { action: { label: 'Ouvrir', run: open } });
}
