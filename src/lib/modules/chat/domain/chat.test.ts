import { describe, expect, it } from 'vitest';
import { askedIn, excerpt, mentionedIds, validBody, validChannelName } from './chat';

const ana = '11111111-1111-4111-8111-111111111111';

describe('chat rules', () => {
	it('normalizes channel names', () => {
		expect(validChannelName(' #Mise en prod ')).toBe('mise-en-prod');
		expect(() => validChannelName('#')).toThrow(/vide/);
	});

	it('accepts an empty text only with a file', () => {
		expect(() => validBody('  ', false)).toThrow(/vide/);
		expect(validBody('  ', true)).toBe('');
	});

	it('finds each mentioned person once', () => {
		expect(mentionedIds(`<@${ana}> tu peux relire ? <@${ana}>`)).toEqual([ana]);
	});

	it('reads a question from a mention and a "?", not from code or links', () => {
		const bastien = '22222222-2222-4222-8222-222222222222';
		expect(askedIn(`<@${ana}> on part sur Stripe ?`, bastien)).toEqual([ana]);
		expect(askedIn(`<@${ana}> regarde https://x.io/?q=1 et \`a ?? b\``, bastien)).toEqual([]);
		expect(askedIn(`Je me demande, <@${bastien}> ?`, bastien)).toEqual([]);
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
