import { describe, expect, it } from 'vitest';
import { parseInline, parseMessage, plainText } from './rich-text';

const ana = '22222222-2222-4222-8222-222222222222';

describe('rich text', () => {
	it('finds code, links, mentions, bold and task references', () => {
		expect(
			parseInline(`<@${ana}> regarde #12 et \`npm test\` sur https://crystal.dev/a. **vite**`)
		).toEqual([
			{ type: 'mention', userId: ana },
			{ type: 'text', text: ' regarde ' },
			{ type: 'task', number: 12 },
			{ type: 'text', text: ' et ' },
			{ type: 'code', text: 'npm test' },
			{ type: 'text', text: ' sur ' },
			{ type: 'link', href: 'https://crystal.dev/a', text: 'crystal.dev/a' },
			{ type: 'text', text: '. ' },
			{ type: 'bold', text: 'vite' }
		]);
	});

	it('reads what the text editor writes: links, italics and escapes', () => {
		expect(
			parseInline(
				'[la doc](https://a.fr/x) et [https://b.fr](https://b.fr), *vite*, 3 \\* 4, a\\_b'
			)
		).toEqual([
			{ type: 'link', href: 'https://a.fr/x', text: 'la doc' },
			{ type: 'text', text: ' et ' },
			{ type: 'link', href: 'https://b.fr', text: 'b.fr' },
			{ type: 'text', text: ', ' },
			{ type: 'italic', text: 'vite' },
			{ type: 'text', text: ', 3 * 4, a_b' }
		]);
	});

	it('does not read a URL anchor or a word as a task', () => {
		expect(parseInline('page#12 et C#3')).toEqual([{ type: 'text', text: 'page#12 et C#3' }]);
	});

	it('keeps HTML as plain text', () => {
		expect(parseInline('<img src=x onerror=alert(1)>')).toEqual([
			{ type: 'text', text: '<img src=x onerror=alert(1)>' }
		]);
	});

	it('splits code fences, quotes and paragraphs', () => {
		const blocks = parseMessage('Voilà :\n```ts\nconst a = 1;\n```\n> cité\nfin');
		expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'code', 'quote', 'paragraph']);
		expect(blocks[1]).toEqual({ type: 'code', lang: 'ts', text: 'const a = 1;' });
	});

	it('writes a one-line version', () => {
		expect(plainText(`<@${ana}> peux-tu\n\`\`\`\ncode\n\`\`\`\n relire ?`)).toBe(
			'peux-tu relire ?'
		);
	});
});
