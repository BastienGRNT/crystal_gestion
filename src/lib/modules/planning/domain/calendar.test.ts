import { describe, expect, it } from 'vitest';
import {
	addDays,
	atMinutes,
	clockLabel,
	dayKey,
	daySegment,
	minutesFrom,
	parseDayKey,
	shiftIso,
	snap,
	startOfWeek,
	weekDays
} from './calendar';

describe('calendar', () => {
	const wednesday = new Date(2026, 8, 30, 15, 20);

	it('starts weeks on Monday', () => {
		expect(dayKey(startOfWeek(wednesday))).toBe('2026-09-28');
		expect(dayKey(startOfWeek(new Date(2026, 9, 4)))).toBe('2026-09-28');
		expect(weekDays(wednesday).map((day) => day.getDate())).toEqual([28, 29, 30, 1, 2, 3, 4]);
	});

	it('adds calendar days across months', () => {
		expect(dayKey(addDays(wednesday, 2))).toBe('2026-10-02');
	});

	it('snaps to 15 minutes', () => {
		expect(snap(7)).toBe(0);
		expect(snap(8)).toBe(15);
		expect(snap(598)).toBe(600);
	});

	it('converts between minutes of a day and dates', () => {
		expect(minutesFrom(wednesday, wednesday)).toBe(15 * 60 + 20);
		expect(atMinutes(wednesday, 570).getHours()).toBe(9);
		expect(atMinutes(wednesday, 570).getMinutes()).toBe(30);
		expect(clockLabel(570)).toBe('9:30');
		expect(shiftIso('2026-09-30T10:00:00.000Z', 90)).toBe('2026-09-30T11:30:00.000Z');
	});

	it('clips a range to a day', () => {
		const day = new Date(2026, 8, 30);
		const late = daySegment(day, atMinutes(day, 22 * 60), atMinutes(day, 26 * 60));
		expect(late).toEqual({ start: 1320, end: 1440, clippedStart: false, clippedEnd: true });
		const next = daySegment(addDays(day, 1), atMinutes(day, 22 * 60), atMinutes(day, 26 * 60));
		expect(next).toEqual({ start: 0, end: 120, clippedStart: true, clippedEnd: false });
		expect(daySegment(addDays(day, 2), atMinutes(day, 60), atMinutes(day, 120))).toBeNull();
	});

	it('parses day keys strictly', () => {
		expect(parseDayKey('2026-10-02')).toEqual(new Date(2026, 9, 2));
		expect(parseDayKey('2026-02-31')).toBeNull();
		expect(parseDayKey('demain')).toBeNull();
		expect(parseDayKey(null)).toBeNull();
	});
});
