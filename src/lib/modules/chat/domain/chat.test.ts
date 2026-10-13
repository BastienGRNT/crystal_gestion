import { describe, expect, it } from 'vitest';
import { excerpt, mentionedIds, validBody, validChannelName } from './chat';

const ana = '11111111-1111-4111-8111-111111111111';

describe('chat rules', () => {
	it('normalizes channel names', () => {
		expect(validChannelName(' #Marketing ')).toBe('marketing');
		expect(() => validChannelName('#')).toThrow(/vide/);
	});

	it('accepts an empty text only with a file', () => {
		expect(() => validBody('  ', false)).toThrow(/vide/);
		expect(validBody('  ', true)).toBe('');
	});

	it('finds each mentioned person once', () => {
		expect(mentionedIds(`<@${ana}> tu peux relire ? <@${ana}>`)).toEqual([ana]);
	});

	it('writes readable excerpts', () => {
		const names = new Map([[ana, 'Ana']]);
		expect(excerpt(`<@${ana}> regarde\n\`\`\`ts\nconst a = 1\n\`\`\``, names)).toBe(
			'@Ana regarde [code]'
		);
		expect(excerpt('x'.repeat(200), names, 10)).toBe('xxxxxxxxx…');
		expect(excerpt('', names)).toBe('Fichier joint');
	});
});
