import { describe, expect, it } from 'vitest';
import { decodeMentions, encodeMentions } from './mentions';

const ana = { id: '11111111-1111-1111-1111-111111111111', name: 'Ana' };
const anabelle = { id: '22222222-2222-2222-2222-222222222222', name: 'Anabelle Roy' };

describe('mention encoding', () => {
	it('round-trips names and tokens, preferring the longest name', () => {
		const text = '@Anabelle Roy et @Ana, vous validez ?';
		const body = encodeMentions(text, [ana, anabelle]);
		expect(body).toBe(`<@${anabelle.id}> et <@${ana.id}>, vous validez ?`);
		expect(decodeMentions(body, [ana, anabelle])).toBe(text);
	});

	it('does not match a name inside a longer word', () => {
		expect(encodeMentions('@Anatole', [ana])).toBe('@Anatole');
	});
});
