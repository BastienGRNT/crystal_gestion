import { describe, expect, it } from 'vitest';
import { nextColor, validEmail, validPassword, validStatusNote } from './user';
import { isUsable, shouldRenew } from './session';

describe('user rules', () => {
	it('normalizes emails and rejects malformed ones', () => {
		expect(validEmail('  Ana@Crystal.TEST ')).toBe('ana@crystal.test');
		expect(() => validEmail('ana@')).toThrow(/valide/);
	});

	it('asks for 8 characters at least', () => {
		expect(() => validPassword('short')).toThrow(/8 caractères/);
		expect(validPassword('longenough')).toBe('longenough');
	});

	it('turns a blank status note into null', () => {
		expect(validStatusNote('   ')).toBeNull();
		expect(validStatusNote(' En réunion ')).toBe('En réunion');
	});

	it('picks the first free color', () => {
		expect(nextColor([0, 1])).toBe(2);
		expect(nextColor([0, 1, 2, 3, 4, 5, 6, 7])).toBe(0);
	});
});

describe('sessions and invitations', () => {
	const now = new Date('2026-10-13T10:00:00Z');

	it('renews a session past half of its life', () => {
		expect(shouldRenew(new Date('2026-10-20T10:00:00Z'), now)).toBe(true);
		expect(shouldRenew(new Date('2026-11-10T10:00:00Z'), now)).toBe(false);
	});

	it('refuses used or expired invitations', () => {
		const base = { createdBy: 'u1', expiresAt: new Date('2026-10-14T00:00:00Z'), usedAt: null };
		expect(isUsable(base, now)).toBe(true);
		expect(isUsable({ ...base, usedAt: now }, now)).toBe(false);
		expect(isUsable({ ...base, expiresAt: new Date('2026-10-12T00:00:00Z') }, now)).toBe(false);
	});
});
