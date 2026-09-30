import { describe, expect, it } from 'vitest';
import { findTrigger, insertAt } from './trigger';

describe('reference trigger', () => {
	it('detects a hash or at sign being typed', () => {
		expect(findTrigger('voir #pai', 9)).toEqual({ symbol: '#', query: 'pai', start: 5 });
		expect(findTrigger('@An', 3)).toEqual({ symbol: '@', query: 'An', start: 0 });
		expect(findTrigger('mail a@b', 8)).toBeNull();
		expect(findTrigger('voir #pai fin', 13)).toBeNull();
	});

	it('replaces the query with the chosen token', () => {
		const trigger = findTrigger('voir #pai et', 9)!;
		expect(insertAt('voir #pai et', trigger, 9, '#F-3')).toEqual({
			text: 'voir #F-3  et',
			caret: 10
		});
	});
});
