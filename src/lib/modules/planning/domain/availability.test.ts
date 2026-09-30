import { describe, expect, it } from 'vitest';
import { isOnDay, overlaps, periodSlot } from './availability';

describe('availability', () => {
	const day = new Date(2026, 8, 30);

	it('builds quick slots in local time', () => {
		const slot = periodSlot(day, 'evening');
		expect(new Date(slot.startsAt).getHours()).toBe(19);
		expect(new Date(slot.endsAt).getHours()).toBe(23);
	});

	it('detects overlapping slots', () => {
		const evening = periodSlot(day, 'evening');
		expect(overlaps(evening, periodSlot(day, 'afternoon'))).toBe(false);
		expect(overlaps(evening, { startsAt: evening.startsAt, endsAt: evening.endsAt })).toBe(true);
	});

	it('knows which day a slot belongs to', () => {
		expect(isOnDay(periodSlot(day, 'morning'), day)).toBe(true);
		expect(isOnDay(periodSlot(day, 'morning'), new Date(2026, 9, 1))).toBe(false);
	});
});
