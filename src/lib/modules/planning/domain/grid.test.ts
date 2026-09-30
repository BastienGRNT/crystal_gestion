import { describe, expect, it } from 'vitest';
import {
	columnAt,
	hourAt,
	minutesToPx,
	moveRange,
	pxToMinutes,
	pxToSnappedMinutes,
	rangeBetween,
	resizeEnd,
	resizeStart,
	toDayRange
} from './grid';

const scale = { hourHeight: 48 };

describe('agenda grid', () => {
	it('converts pixels and minutes', () => {
		expect(minutesToPx(90, scale)).toBe(72);
		expect(pxToMinutes(72, scale)).toBe(90);
		expect(pxToSnappedMinutes(75, scale)).toBe(90);
		expect(pxToSnappedMinutes(-20, scale)).toBe(0);
		expect(pxToSnappedMinutes(5000, scale)).toBe(1440);
	});

	it('finds the column under the pointer', () => {
		expect(columnAt(0, 700, 7)).toBe(0);
		expect(columnAt(350, 700, 7)).toBe(3);
		expect(columnAt(800, 700, 7)).toBe(6);
	});

	it('draws ranges in both directions with a minimum length', () => {
		expect(rangeBetween(600, 540)).toEqual({ start: 540, end: 600 });
		expect(rangeBetween(600, 600)).toEqual({ start: 600, end: 615 });
		expect(rangeBetween(1440, 1440)).toEqual({ start: 1425, end: 1440 });
	});

	it('moves a range inside the day', () => {
		expect(moveRange(600, 660, 1420)).toEqual({ start: 1380, end: 1440 });
		expect(moveRange(600, 660, -30)).toEqual({ start: 0, end: 60 });
	});

	it('creates one-hour slots on tap', () => {
		expect(hourAt(615)).toEqual({ start: 600, end: 660 });
		expect(hourAt(1435)).toEqual({ start: 1380, end: 1440 });
	});

	it('draws a slot across midnight, whichever way the pointer goes', () => {
		const week = 7 * 1440;
		expect(toDayRange(rangeBetween(1380, 1500, week))).toEqual({ day: 0, start: 1380, end: 1500 });
		expect(toDayRange(rangeBetween(1500, 1380, week))).toEqual({ day: 0, start: 1380, end: 1500 });
	});

	it('moves and resizes past midnight within the displayed days', () => {
		expect(moveRange(1320, 1380, 1410, 2880)).toEqual({ start: 1410, end: 1470 });
		expect(moveRange(1320, 1380, 2870, 2880)).toEqual({ start: 2820, end: 2880 });
		expect(resizeEnd(1320, 1560, 2880)).toBe(1560);
		expect(resizeEnd(1320, 3000, 2880)).toBe(2760);
		expect(resizeStart(1560, 0)).toBe(120);
	});
});
