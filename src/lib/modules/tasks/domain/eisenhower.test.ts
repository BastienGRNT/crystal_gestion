import { describe, expect, it } from 'vitest';
import { isPlacedByHand, isUrgent, QUADRANT_AXES, quadrantOf } from './eisenhower';

const today = new Date(2026, 8, 30);
const task = (
	dueDate: string | null,
	important: boolean | null = null,
	urgent: boolean | null = null
) => ({
	dueDate,
	important,
	urgent
});

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

	it('keeps a task where it was dropped in the matrix, whatever its date and feature', () => {
		for (const [quadrant, axes] of Object.entries(QUADRANT_AXES))
			expect(quadrantOf(task('2026-10-01', axes.important, axes.urgent), 'wont', today)).toBe(
				quadrant
			);
	});

	it('tells a placed-by-hand task from an automatic one', () => {
		expect(isPlacedByHand(task(null))).toBe(false);
		expect(isPlacedByHand(task(null, null, false))).toBe(true);
	});
});
