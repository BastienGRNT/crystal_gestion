import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, isDateKey, startOfWeek, weekdayOf, weekDays } from './dates';

describe('date keys', () => {
	it('validates the YYYY-MM-DD format', () => {
		expect(isDateKey('2026-10-13')).toBe(true);
		expect(isDateKey('2026-1-3')).toBe(false);
		expect(isDateKey('demain')).toBe(false);
	});

	it('adds days across months and years', () => {
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
	});

	it('counts days between two dates, even across a DST change', () => {
		expect(daysBetween('2026-10-20', '2026-10-27')).toBe(7);
		expect(daysBetween('2026-10-27', '2026-10-20')).toBe(-7);
	});

	it('starts weeks on Monday', () => {
		expect(weekdayOf('2026-10-12')).toBe(0);
		expect(weekdayOf('2026-10-18')).toBe(6);
		expect(startOfWeek('2026-10-18')).toBe('2026-10-12');
		expect(weekDays('2026-10-12').at(-1)).toBe('2026-10-18');
	});
});
