import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toasts } from '../toasts.svelte';
import { deleteWithUndo, flushPendingDeletes } from './undoable';

describe('delete with undo', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const setup = () => {
		const restore = vi.fn();
		const request = vi.fn(async () => {});
		deleteWithUndo('Idée supprimée', () => restore, request);
		return { restore, request, toast: toasts.items.at(-1)! };
	};

	it('only asks the server once the toast has expired', () => {
		const { request } = setup();
		expect(request).not.toHaveBeenCalled();
		vi.advanceTimersByTime(6000);
		expect(request).toHaveBeenCalledOnce();
	});

	it('restores locally and never calls the server when undone', () => {
		const { restore, request, toast } = setup();
		toasts.act(toast);
		vi.advanceTimersByTime(6000);
		expect(restore).toHaveBeenCalledOnce();
		expect(request).not.toHaveBeenCalled();
	});

	it('sends pending deletions when leaving the page', () => {
		const { request } = setup();
		flushPendingDeletes();
		vi.advanceTimersByTime(6000);
		expect(request).toHaveBeenCalledOnce();
	});

	it('puts the element back if the server refuses', async () => {
		const restore = vi.fn();
		deleteWithUndo(
			'x',
			() => restore,
			() => Promise.reject(new Error('non'))
		);
		flushPendingDeletes();
		await vi.runAllTimersAsync();
		expect(restore).toHaveBeenCalledOnce();
	});
});
