import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug, validDeadline, validProjectName } from './project';

describe('projects', () => {
	it('builds readable slugs from any name', () => {
		expect(slugify('Atelier Pixel — V2 !')).toBe('atelier-pixel-v2');
		expect(slugify('Écran d’accueil')).toBe('ecran-d-accueil');
		expect(slugify('???')).toBe('projet');
	});

	it('never reuses a slug', () => {
		expect(uniqueSlug('Crystal', [])).toBe('crystal');
		expect(uniqueSlug('Crystal', ['crystal', 'crystal-2'])).toBe('crystal-3');
	});

	it('validates names and deadlines', () => {
		expect(validProjectName('  Site vitrine ')).toBe('Site vitrine');
		expect(() => validProjectName(' ')).toThrow(/vide/);
		expect(validDeadline('2026-12-01')).toBe('2026-12-01');
		expect(() => validDeadline('01/12/2026')).toThrow(/invalide/);
	});
});
