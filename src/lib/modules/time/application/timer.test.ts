import { describe, expect, it, vi } from 'vitest';
import type { TimeEntry } from '../domain/time-entry';
import { makeTaskTimer } from './timer';

const entry = (taskId: string, startedAt = '2026-09-30T10:00:00Z', userId = 'u'): TimeEntry => ({
	...{ id: `e-${taskId}`, projectId: 'p', userId, taskId, startedAt },
	...{ endedAt: null, source: 'timer' }
});
const NOW = new Date('2026-09-30T11:00:00Z');

const setup = (current: TimeEntry[]) => {
	const entries = {
		create: vi.fn(async (e: Omit<TimeEntry, 'id'>) => ({ ...e, id: 'new' })),
		update: vi.fn(async (id: string, changes: Partial<TimeEntry>) => ({
			...entry('x'),
			id,
			...changes
		})),
		runningForUser: vi.fn(async () => current),
		runningForTask: vi.fn(async () => current),
		delete: vi.fn(async () => {}),
		findOwned: vi.fn(),
		list: vi.fn()
	};
	const view = {
		entry: entry('b'),
		task: { ref: 'T-2', title: 'B' },
		project: { slug: 'p', name: 'P' }
	};
	const deps = {
		entries,
		feed: { upserted: vi.fn(), deleted: vi.fn() },
		clock: { now: () => NOW },
		running: { forUser: vi.fn(async () => view) },
		timerFeed: { changed: vi.fn() }
	};
	return { ...deps, view, timer: makeTaskTimer(deps) };
};

describe('task timer', () => {
	it('stops the running timer before starting another task', async () => {
		const { entries, timer } = setup([entry('a')]);
		await timer.start('p', 'u', 'b');
		expect(entries.update).toHaveBeenCalledWith('e-a', { endedAt: NOW.toISOString() });
		expect(entries.create).toHaveBeenCalledWith(
			expect.objectContaining({ taskId: 'b', endedAt: null })
		);
	});

	it('returns the new timer and pushes it to all my tabs', async () => {
		const { timer, timerFeed, view } = setup([]);
		expect(await timer.start('p', 'u', 'b')).toBe(view);
		expect(timerFeed.changed).toHaveBeenCalledWith('u', view);
	});

	it('keeps an already running timer on the same task', async () => {
		const { entries, timer } = setup([entry('a')]);
		await timer.start('p', 'u', 'a');
		expect(entries.update).not.toHaveBeenCalled();
		expect(entries.create).not.toHaveBeenCalled();
	});

	it('records a work block when stopped', async () => {
		const { entries, feed, timer } = setup([entry('a')]);
		await timer.stopForUser('u');
		expect(feed.upserted).toHaveBeenCalledWith(
			'timeEntry',
			'p',
			expect.objectContaining({ endedAt: NOW.toISOString() })
		);
		expect(entries.delete).not.toHaveBeenCalled();
	});

	it('drops a timer stopped within a minute instead of cluttering the planning', async () => {
		const { entries, feed, timer } = setup([entry('a', '2026-09-30T10:59:30Z')]);
		await timer.stopForUser('u');
		expect(entries.delete).toHaveBeenCalledWith('e-a');
		expect(feed.deleted).toHaveBeenCalledWith('timeEntry', 'p', 'e-a');
	});

	it('tells every person whose timer ran on a finished task', async () => {
		const { running, timer, timerFeed } = setup([
			entry('a', undefined, 'u'),
			{ ...entry('a', undefined, 'v'), id: 'e2' }
		]);
		running.forUser.mockResolvedValue(null as never);
		await timer.stopForTask('a');
		expect(timerFeed.changed).toHaveBeenCalledWith('u', null);
		expect(timerFeed.changed).toHaveBeenCalledWith('v', null);
	});
});
