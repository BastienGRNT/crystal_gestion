import { describe, expect, it } from 'vitest';
import {
	availabilityAt,
	emptyWeek,
	normalizeSlots,
	overlap,
	slotsOn,
	totalMinutes,
	type Availability
} from './availability';

const evening = { start: '19:00', end: '23:00' };

describe('slots', () => {
	it('sorts and merges overlapping slots', () => {
		expect(
			normalizeSlots([
				{ start: '14:00', end: '18:00' },
				{ start: '09:00', end: '12:00' },
				{ start: '11:30', end: '13:00' }
			])
		).toEqual([
			{ start: '09:00', end: '13:00' },
			{ start: '14:00', end: '18:00' }
		]);
	});

	it('refuses impossible times', () => {
		expect(() => normalizeSlots([{ start: '19:00', end: '18:00' }])).toThrow(/finir après/);
		expect(() => normalizeSlots([{ start: '25:00', end: '26:00' }])).toThrow(/invalide/);
		expect(normalizeSlots([{ start: '22:00', end: '24:00' }])).toHaveLength(1);
	});

	it('finds when two people are free together', () => {
		const ana = [{ start: '09:00', end: '12:00' }, evening];
		const bastien = [{ start: '20:30', end: '23:30' }];
		expect(overlap(ana, bastien)).toEqual([{ start: '20:30', end: '23:00' }]);
		expect(overlap(ana, [])).toEqual([]);
	});

	it('says whether someone is available now, later or done', () => {
		const slots = [{ start: '09:00', end: '12:00' }, evening];
		expect(availabilityAt(slots, '10:15')).toEqual({ state: 'available', until: '12:00' });
		expect(availabilityAt(slots, '15:00')).toEqual({ state: 'later', from: '19:00' });
		expect(availabilityAt(slots, '23:30')).toEqual({ state: 'done' });
		expect(availabilityAt([], '10:00')).toEqual({ state: 'off' });
		expect(totalMinutes(slots)).toBe(420);
	});
});

describe('usual week and exceptions', () => {
	const template = emptyWeek();
	template[1] = [evening];
	const availability: Availability = {
		userId: 'ana',
		template,
		overrides: [{ date: '2026-10-20', slots: [] }]
	};

	it('fills a day from the usual week', () => {
		// Tuesday
		expect(slotsOn(availability, '2026-10-13')).toEqual([evening]);
		expect(slotsOn(availability, '2026-10-14')).toEqual([]);
	});

	it('lets a specific day differ, even to say "not available"', () => {
		expect(slotsOn(availability, '2026-10-20')).toEqual([]);
	});
});
