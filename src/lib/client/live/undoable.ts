import { toasts } from '../toasts.svelte';

const UNDO_WINDOW_MS = 6000;
const pending = new Set<() => void>();

/**
 * Deletion used everywhere: the element disappears at once, the server is only asked once the
 * "Annuler" toast expires. Undoing is a pure local restore, so no server "undelete" is needed.
 */
export function deleteWithUndo(
	message: string,
	removeLocally: () => () => void,
	request: () => Promise<unknown>
) {
	const restore = removeLocally();
	const commit = () => {
		pending.delete(commit);
		request().catch((cause) => {
			restore();
			toasts.error(cause instanceof Error ? cause.message : 'Suppression impossible');
		});
	};
	pending.add(commit);
	const undo = () => (pending.delete(commit), restore());
	toasts.show(message, 'info', {
		action: { label: 'Annuler', run: undo },
		onexpire: () => pending.has(commit) && commit(),
		duration: UNDO_WINDOW_MS
	});
}

/** Leaving the page must not lose deletions still waiting for their toast. */
export const flushPendingDeletes = () => [...pending].forEach((commit) => commit());
