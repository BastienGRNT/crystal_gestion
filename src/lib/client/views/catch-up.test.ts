import { describe, expect, it } from 'vitest';
import type { Activity } from '$lib/modules/activity/domain/activity';
import type { ActivityVerb } from '$lib/modules/kernel/domain/subject';
import { teamProgress } from './catch-up';

const line = (verb: ActivityVerb, taskId: string, at: string, actorId = 'camille'): Activity => ({
	id: `${verb}-${taskId}-${at}`,
	projectId: 'p',
	actorId,
	verb,
	subject: { kind: 'task', id: taskId, title: taskId, projectId: 'p' },
	createdAt: at
});

describe('team progress since my last visit', () => {
	it('keeps each task once, in its latest state, and ignores me and older news', () => {
		const [camille, ...rest] = teamProgress(
			[
				line('task.started', 't1', '2026-10-12T09:00:00Z'),
				line('task.done', 't1', '2026-10-12T15:00:00Z'),
				line('task.started', 't2', '2026-10-12T16:00:00Z'),
				line('task.done', 't3', '2026-10-10T10:00:00Z'),
				line('task.done', 't4', '2026-10-12T17:00:00Z', 'me')
			],
			'2026-10-11T00:00:00Z',
			'me'
		);
		expect(rest).toEqual([]);
		expect(camille.done.map((s) => s.id)).toEqual(['t1']);
		expect(camille.started.map((s) => s.id)).toEqual(['t2']);
	});
});
