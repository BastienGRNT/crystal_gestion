import { describe, expect, it } from 'vitest';
import { matchesAccessCode } from './access-code';

describe('access code', () => {
	it('accepts the configured code, ignoring surrounding spaces', () => {
		expect(matchesAccessCode('cristal-2026', ' cristal-2026 ')).toBe(true);
	});

	it('refuses a wrong or partial code', () => {
		expect(matchesAccessCode('cristal-2026', 'cristal')).toBe(false);
		expect(matchesAccessCode('cristal-2026', 'cristal-2027')).toBe(false);
	});

	it('stays closed when no code is configured', () => {
		expect(matchesAccessCode(null, '')).toBe(false);
		expect(matchesAccessCode('', '')).toBe(false);
	});
});
