import { describe, expect, it, vi } from 'vitest';
import type { TimeEntry } from '../domain/time-entry';
import { makeTaskTimer } from './timer';

const running = (taskId: string): TimeEntry => ({
	id: `e-${taskId}`,
	projectId: 'p',
	userId: 'u',
	taskId,
	startedAt: '2026-09-30T10:00:00Z',
	endedAt: null,
	source: 'timer'
});

const setup = (current: TimeEntry[]) => {
	const entries = {
		create: vi.fn(async (entry: Omit<TimeEntry, 'id'>) => ({ ...entry, id: 'new' })),
		update: vi.fn(async (id: string, changes: Partial<TimeEntry>) => ({
			...running('x'),
			id,
			...changes
		})),
		runningForUser: vi.fn(async () => current),
		runningForTask: vi.fn(async () => current),
		delete: vi.fn(),
		findOwned: vi.fn(),
		list: vi.fn()
	};
	const now = new Date('2026-09-30T11:00:00Z');
	return {
		entries,
		timer: makeTaskTimer({
			entries,
			feed: { upserted: vi.fn(), deleted: vi.fn() },
			clock: { now: () => now }
		})
	};
};

describe('task timer', () => {
	it('stops the running timer before starting another task', async () => {
		const { entries, timer } = setup([running('a')]);
		await timer.start('p', 'u', 'b');
		expect(entries.update).toHaveBeenCalledWith('e-a', { endedAt: '2026-09-30T11:00:00.000Z' });
		expect(entries.create).toHaveBeenCalledWith(
			expect.objectContaining({ taskId: 'b', endedAt: null })
		);
	});

	it('keeps an already running timer on the same task', async () => {
		const { entries, timer } = setup([running('a')]);
		await timer.start('p', 'u', 'a');
		expect(entries.update).not.toHaveBeenCalled();
		expect(entries.create).not.toHaveBeenCalled();
	});
});
