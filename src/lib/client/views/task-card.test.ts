import { describe, expect, it } from 'vitest';
import { dueTone } from './task-card';

describe('dueTone', () => {
	const today = new Date(2026, 8, 30);

	it('flags late and soon deadlines of open tasks', () => {
		expect(dueTone('2026-09-29', false, today)).toBe('late');
		expect(dueTone('2026-10-02', false, today)).toBe('soon');
		expect(dueTone('2026-10-20', false, today)).toBeNull();
		expect(dueTone('2026-09-29', true, today)).toBeNull();
	});
});
