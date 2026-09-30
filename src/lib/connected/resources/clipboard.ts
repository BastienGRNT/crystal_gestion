import { toasts } from '$lib/client/toasts.svelte';

export async function copy(value: string, what: string) {
	try {
		await navigator.clipboard.writeText(value);
		toasts.success(`${what} copié`);
	} catch {
		toasts.error('Copie impossible dans ce navigateur');
	}
}
