import { describe, expect, it } from 'vitest';
import { positionBetween } from './position';
import { progressOf } from './progress';

describe('progressOf', () => {
	it('counts done tasks', () => {
		expect(
			progressOf([{ status: 'done' }, { status: 'todo' }, { status: 'review' }, { status: 'done' }])
		).toEqual({
			done: 2,
			total: 4,
			ratio: 0.5
		});
	});

	it('is zero without tasks', () => {
		expect(progressOf([]).ratio).toBe(0);
	});

	it('ignores icebox tasks: nobody committed to them yet', () => {
		expect(progressOf([{ status: 'done' }, { status: 'icebox' }])).toEqual({
			done: 1,
			total: 1,
			ratio: 1
		});
	});
});

describe('positionBetween', () => {
	it('places between, before and after neighbours', () => {
		expect(positionBetween(1, 2)).toBe(1.5);
		expect(positionBetween(undefined, 1024)).toBe(0);
		expect(positionBetween(1024, undefined)).toBe(2048);
	});
});
