import { describe, expect, it } from 'vitest';
import { registerVisit } from './visit';

const at = (hours: number) => new Date(Date.UTC(2026, 0, 1, hours));

describe('registerVisit', () => {
	it('starts the recap now on a first visit', () => {
		expect(registerVisit({ lastSeenAt: null, recapSince: null }, at(10))).toEqual({
			lastSeenAt: at(10),
			recapSince: at(10)
		});
	});

	it('keeps the recap window during the same visit', () => {
		const state = { lastSeenAt: at(10), recapSince: at(2) };
		expect(registerVisit(state, new Date(at(10).getTime() + 5 * 60_000)).recapSince).toEqual(at(2));
	});

	it('opens a new recap window after an hour away', () => {
		const state = { lastSeenAt: at(10), recapSince: at(2) };
		expect(registerVisit(state, at(13)).recapSince).toEqual(at(10));
	});
});
