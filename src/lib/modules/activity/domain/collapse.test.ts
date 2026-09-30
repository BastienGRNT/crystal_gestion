import { describe, expect, it } from 'vitest';
import type { Activity } from './activity';
import { collapseActivity } from './collapse';

const activity = (id: string, verb: Activity['verb'], minute: number, actorId = 'ana', elementRef = 'T-1'): Activity => ({
	id, projectId: 'p', actorId, verb, elementId: 'e', elementRef, elementKind: 'task', elementTitle: 't', details: {},
	createdAt: new Date(Date.UTC(2026, 0, 1, 12, minute)).toISOString()
});

describe('collapseActivity', () => {
	it('merges repeated edits of one element by one person', () => {
		const feed = [activity('3', 'updated', 20), activity('2', 'updated', 10), activity('1', 'created', 0)];
		expect(collapseActivity(feed).map((a) => a.id)).toEqual(['3', '1']);
	});

	it('keeps edits by other people or on other elements', () => {
		const feed = [activity('3', 'updated', 20), activity('2', 'updated', 10, 'leo'), activity('1', 'updated', 5, 'ana', 'T-2')];
		expect(collapseActivity(feed)).toHaveLength(3);
	});
});
