const REF_PATTERN = /#([A-Z]-\d+)\b/g;

export type TextToken = { type: 'text'; value: string } | { type: 'ref'; ref: string };

export function extractRefs(text: string): string[] {
	const refs = Array.from(text.matchAll(REF_PATTERN), (match) => match[1]);
	return [...new Set(refs)];
}

export function tokenize(text: string): TextToken[] {
	const tokens: TextToken[] = [];
	let cursor = 0;
	for (const match of text.matchAll(REF_PATTERN)) {
		if (match.index > cursor) tokens.push({ type: 'text', value: text.slice(cursor, match.index) });
		tokens.push({ type: 'ref', ref: match[1] });
		cursor = match.index + match[0].length;
	}
	if (cursor < text.length) tokens.push({ type: 'text', value: text.slice(cursor) });
	return tokens;
}
