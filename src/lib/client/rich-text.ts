/**
 * Turns a message into blocks and inline pieces that components render as plain elements:
 * no HTML is ever injected, so a message can never run code in someone else's browser.
 */
export type Inline =
	| { type: 'text'; text: string }
	| { type: 'break' }
	| { type: 'code'; text: string }
	| { type: 'bold'; text: string }
	| { type: 'link'; href: string; text: string }
	| { type: 'mention'; userId: string }
	| { type: 'task'; number: number };

export type Block =
	| { type: 'paragraph'; inlines: Inline[] }
	| { type: 'quote'; inlines: Inline[] }
	| { type: 'code'; lang: string; text: string };

const INLINE =
	/(`[^`\n]+`)|(<@[0-9a-f-]{36}>)|(https?:\/\/[^\s<>]*[^\s<>.,;:!?)\]'"»])|(\*\*[^*\n]+\*\*)|((?:^|(?<=[\s(]))#\d{1,6}\b)/g;

export function parseInline(text: string): Inline[] {
	const out: Inline[] = [];
	let last = 0;
	for (const match of text.matchAll(INLINE)) {
		const [token, code, mention, url, bold, task] = match;
		if (match.index > last) out.push({ type: 'text', text: text.slice(last, match.index) });
		if (code) out.push({ type: 'code', text: code.slice(1, -1) });
		else if (mention) out.push({ type: 'mention', userId: mention.slice(2, -1) });
		else if (url)
			out.push({ type: 'link', href: url, text: url.replace(/^https?:\/\/(www\.)?/, '') });
		else if (bold) out.push({ type: 'bold', text: bold.slice(2, -2) });
		else if (task) out.push({ type: 'task', number: Number(task.slice(1)) });
		last = match.index + token.length;
	}
	if (last < text.length) out.push({ type: 'text', text: text.slice(last) });
	return out;
}

function lines(text: string): Inline[] {
	return text
		.split('\n')
		.flatMap((line, i) => [...(i ? [{ type: 'break' } as const] : []), ...parseInline(line)]);
}

function proseBlocks(text: string): Block[] {
	const blocks: Block[] = [];
	const groups = text.split('\n').reduce<{ quote: boolean; lines: string[] }[]>((acc, line) => {
		const quote = line.startsWith('> ') || line === '>';
		const content = quote ? line.replace(/^>\s?/, '') : line;
		const current = acc.at(-1);
		if (current && current.quote === quote) current.lines.push(content);
		else acc.push({ quote, lines: [content] });
		return acc;
	}, []);
	for (const group of groups) {
		const content = group.lines.join('\n').replace(/^\n+|\n+$/g, '');
		if (!content) continue;
		blocks.push({ type: group.quote ? 'quote' : 'paragraph', inlines: lines(content) });
	}
	return blocks;
}

export function parseMessage(body: string): Block[] {
	const blocks: Block[] = [];
	const fence = /```([\w+-]*)\n?([\s\S]*?)```/g;
	let last = 0;
	for (const match of body.matchAll(fence)) {
		blocks.push(...proseBlocks(body.slice(last, match.index)));
		blocks.push({ type: 'code', lang: match[1], text: match[2].replace(/\n$/, '') });
		last = match.index + match[0].length;
	}
	blocks.push(...proseBlocks(body.slice(last)));
	return blocks;
}

/** The message as one line of plain text (for a task created from it, a search…). */
export const plainText = (body: string) =>
	body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<@[0-9a-f-]{36}>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
