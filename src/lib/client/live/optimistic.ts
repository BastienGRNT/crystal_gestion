import { toasts } from '../toasts.svelte';

/** Applies a local change immediately, then rolls it back if the server refuses it. */
export async function optimistic<T>(
	apply: () => () => void,
	request: () => Promise<T>
): Promise<T | undefined> {
	const rollback = apply();
	try {
		return await request();
	} catch (cause) {
		rollback();
		toasts.error(cause instanceof Error ? cause.message : 'Action impossible');
		return undefined;
	}
}

/** Runs a request and reports failures without any local change. */
export const attempt = <T>(request: () => Promise<T>) => optimistic(() => () => {}, request);

let draftCounter = 0;

/** Temporary id for an element shown before the server has created it. */
export const draftId = () => `draft-${Date.now()}-${draftCounter++}`;

export const isDraft = (id: string) => id.startsWith('draft-');

/** Merges several rollbacks into one. */
export const combine =
	(...rollbacks: (() => void)[]) =>
	() =>
		rollbacks.forEach((rollback) => rollback());
