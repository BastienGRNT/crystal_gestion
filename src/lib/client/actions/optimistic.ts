import { errorMessage } from '../api';
import type { AppState } from '../state/app.svelte';
import { toasts } from '../toasts.svelte';

/**
 * Runs a request for an item already changed on screen. Only the answer to the last pending
 * request lands (older ones would flash stale values); a failure undoes and says why.
 */
export async function settle<T>(
	app: AppState,
	key: string,
	request: Promise<T>,
	onSuccess: (result: T) => void,
	onFailure: () => void
): Promise<T | undefined> {
	app.pending.set(key, (app.pending.get(key) ?? 0) + 1);
	const release = () => {
		const left = (app.pending.get(key) ?? 1) - 1;
		if (left > 0) app.pending.set(key, left);
		else app.pending.delete(key);
		return left;
	};
	try {
		const result = await request;
		if (release() === 0) onSuccess(result);
		return result;
	} catch (error) {
		release();
		onFailure();
		toasts.error(errorMessage(error));
		return undefined;
	}
}

/** Domain rules run on the client too: a refusal is shown before anything is sent. */
export function attempt<T>(build: () => T): T | null {
	try {
		return build();
	} catch (error) {
		toasts.error(error instanceof Error ? error.message : 'Action impossible.');
		return null;
	}
}
