import { describe, expect, it } from 'vitest';
import { excerpt, extractMentions, splitMentions } from './mentions';

const ana = '11111111-1111-1111-1111-111111111111';

describe('mentions', () => {
	it('extracts unique mentioned users', () => {
		expect(extractMentions(`<@${ana}> tu peux voir ? <@${ana}>`)).toEqual([ana]);
	});

	it('renders a readable excerpt', () => {
		expect(excerpt(`<@${ana}>  on part   sur Stripe ?`, () => 'Ana')).toBe(
			'@Ana on part sur Stripe ?'
		);
		expect(excerpt('x'.repeat(200), () => undefined)).toHaveLength(90);
	});

	it('splits a body into text and mentions', () => {
		expect(splitMentions(`salut <@${ana}> !`)).toEqual([
			{ type: 'text', value: 'salut ' },
			{ type: 'mention', userId: ana },
			{ type: 'text', value: ' !' }
		]);
	});
});
