import { describe, expect, it } from 'vitest';
import type { Activity } from '$lib/modules/activity/domain/activity';
import type { TimeEntry } from '$lib/modules/time/domain/time-entry';
import { digestByPerson, lastWorkedTaskId, summarize } from './catch-up';

const activity = (actorId: string, verb: Activity['verb'], ref: string, at: string): Activity => ({
	...{ id: `${actorId}-${ref}-${at}`, projectId: 'p', actorId, verb, elementId: ref },
	...{ elementRef: ref, elementKind: 'task', elementTitle: ref, details: {}, createdAt: at }
});

const entry = (userId: string, taskId: string | null, startedAt: string): TimeEntry => ({
	...{ id: `${userId}-${startedAt}`, projectId: 'p', userId, taskId, startedAt },
	...{ endedAt: startedAt.replace('T10', 'T11'), source: 'timer' }
});

describe('lastWorkedTaskId', () => {
	it('returns my most recent task, ignoring others and blocks without task', () => {
		const entries = [
			entry('me', 't1', '2026-09-20T10:00:00Z'),
			entry('me', 't2', '2026-09-24T10:00:00Z'),
			entry('me', null, '2026-09-25T10:00:00Z'),
			entry('ana', 't3', '2026-09-26T10:00:00Z')
		];
		expect(lastWorkedTaskId(entries, 'me')).toBe('t2');
		expect(lastWorkedTaskId([], 'me')).toBeNull();
	});
});

describe('digestByPerson', () => {
	it('groups by person, most recent first, with a readable summary', () => {
		const digest = digestByPerson([
			activity('ana', 'completed', 'T-1', '2026-09-30T10:00:00Z'),
			activity('leo', 'posted', 'M-1', '2026-09-29T10:00:00Z'),
			activity('ana', 'completed', 'T-2', '2026-09-28T10:00:00Z'),
			activity('ana', 'created', 'T-3', '2026-09-27T10:00:00Z')
		]);
		expect(digest.map((d) => d.actorId)).toEqual(['ana', 'leo']);
		expect(digest[0].summary).toBe('a terminé 2 Tasks · créé 1 Task');
		expect(digest[1].summary).toBe('a écrit 1 message');
	});

	it('counts updates and moves together', () => {
		const items = [
			activity('ana', 'updated', 'T-1', '2026-09-30T10:00:00Z'),
			activity('ana', 'moved', 'T-2', '2026-09-30T09:00:00Z')
		];
		expect(summarize(items)).toBe('a modifié 2 éléments');
	});
});
