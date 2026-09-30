import { describe, expect, it } from 'vitest';
import { isUrgent, quadrantOf } from './eisenhower';

const today = new Date(2026, 8, 30);
const task = (dueDate: string | null, important: boolean | null = null) => ({ dueDate, important });

describe('eisenhower', () => {
	it('is urgent within three days or when overdue', () => {
		expect(isUrgent(task('2026-10-03'), today)).toBe(true);
		expect(isUrgent(task('2026-09-20'), today)).toBe(true);
		expect(isUrgent(task('2026-10-04'), today)).toBe(false);
		expect(isUrgent(task(null), today)).toBe(false);
	});

	it('derives importance from the feature priority', () => {
		expect(quadrantOf(task('2026-10-01'), 'must', today)).toBe('do');
		expect(quadrantOf(task(null), 'should', today)).toBe('plan');
		expect(quadrantOf(task('2026-10-01'), 'could', today)).toBe('ifTime');
		expect(quadrantOf(task(null), null, today)).toBe('later');
	});

	it('lets the task override the feature importance', () => {
		expect(quadrantOf(task(null, true), 'wont', today)).toBe('plan');
		expect(quadrantOf(task('2026-10-01', false), 'must', today)).toBe('ifTime');
	});
});
