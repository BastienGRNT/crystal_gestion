import { describe, expect, it } from 'vitest';
import { isAfterFraming } from './scope';

describe('isAfterFraming', () => {
	const created = new Date('2026-01-01T10:00:00Z');

	it('treats the first day as framing', () => {
		expect(isAfterFraming(created, new Date('2026-01-02T09:00:00Z'))).toBe(false);
	});

	it('considers later additions as scope changes', () => {
		expect(isAfterFraming(created, new Date('2026-01-02T11:00:00Z'))).toBe(true);
	});
});
