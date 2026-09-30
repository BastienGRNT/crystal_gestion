import { describe, expect, it } from 'vitest';
import { dayHeading } from './day-heading';

describe('dayHeading', () => {
	const today = new Date(2026, 8, 30, 15);

	it('names recent days and dates older ones', () => {
		expect(dayHeading('2026-09-30', today).title).toBe('Aujourd’hui');
		expect(dayHeading('2026-09-29', today).title).toBe('Hier');
		expect(dayHeading('2026-09-28', today).title).toBe('Lundi');
		expect(dayHeading('2026-09-12', today)).toEqual({ title: '12 septembre', caption: 'samedi' });
		expect(dayHeading('2025-12-01', today)).toEqual({ title: '1 décembre', caption: '2025' });
	});
});
