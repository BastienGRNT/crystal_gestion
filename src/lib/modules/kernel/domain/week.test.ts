import { describe, expect, it } from 'vitest';
import { isThisWeek, startOfWeek } from './week';

describe('week helpers', () => {
	it('starts weeks on Monday', () => {
		expect(startOfWeek(new Date(2026, 8, 30, 15)).getDate()).toBe(28);
		expect(startOfWeek(new Date(2026, 9, 4, 15)).getDate()).toBe(28);
	});

	it('knows what happened this week', () => {
		const now = new Date(2026, 8, 30, 15);
		expect(isThisWeek(new Date(2026, 8, 28, 9).toISOString(), now)).toBe(true);
		expect(isThisWeek(new Date(2026, 8, 27, 23).toISOString(), now)).toBe(false);
		expect(isThisWeek(null, now)).toBe(false);
	});
});
