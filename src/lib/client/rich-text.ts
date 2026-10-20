/**
 * Turns a message into blocks and inline pieces that components render as plain elements:
 * no HTML is ever injected, so a message can never run code in someone else's browser.
 */
export type Inline =
	| { type: 'text'; text: string }
	| { type: 'break' }
	| { type: 'code'; text: string }
	| { type: 'bold'; text: string }
	| { type: 'italic'; text: string }
	| { type: 'link'; href: string; text: string }
	| { type: 'mention'; userId: string }
	| { type: 'task'; number: number };

export type Block =
	| { type: 'paragraph'; inlines: Inline[] }
	| { type: 'heading'; level: 1 | 2 | 3; inlines: Inline[] }
	| { type: 'list'; ordered: boolean; items: Inline[][] }
	| { type: 'quote'; inlines: Inline[] }
	| { type: 'code'; lang: string; text: string };

const INLINE = new RegExp(
	[
		/(`[^`\n]+`)/,
		/(<@[0-9a-f-]{36}>)/,
		// `[texte](https://…)`, as the text editor writes links.
		/(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/,
		/(https?:\/\/[^\s<>]*[^\s<>.,;:!?)\]'"»])/,
		/(\*\*[^*\n]+\*\*)/,
		/((?<![*\w])\*(?![\s*])[^*\n]+?(?<!\s)\*(?!\*))/,
		/((?:^|(?<=[\s(]))#\d{1,6}\b)/,
		// The editor escapes the characters Markdown would read: `3 \* 4`, `snake\_case`.
		/(\\[\\`*_{}[\]()#+\-.!>~|])/
	]
		.map((r) => r.source)
		.join('|'),
	'g'
);

const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '');

function linkOf(markdown: string): Inline {
	const [, text, href] = markdown.match(/^\[([^\]]+)\]\((.+)\)$/)!;
	return { type: 'link', href, text: text === href ? shortUrl(href) : text };
}

export function parseInline(text: string): Inline[] {
	const out: Inline[] = [];
	let last = 0;
	const push = (piece: Inline) => {
		const prev = out.at(-1);
		if (piece.type === 'text' && prev?.type === 'text') prev.text += piece.text;
		else out.push(piece);
	};
	for (const match of text.matchAll(INLINE)) {
		const [token, code, mention, mdLink, url, bold, italic, task, escaped] = match;
		if (match.index > last) push({ type: 'text', text: text.slice(last, match.index) });
		if (code) push({ type: 'code', text: code.slice(1, -1) });
		else if (mention) push({ type: 'mention', userId: mention.slice(2, -1) });
		else if (mdLink) push(linkOf(mdLink));
		else if (url) push({ type: 'link', href: url, text: shortUrl(url) });
		else if (bold) push({ type: 'bold', text: bold.slice(2, -2) });
		else if (italic) push({ type: 'italic', text: italic.slice(1, -1) });
		else if (task) push({ type: 'task', number: Number(task.slice(1)) });
		else if (escaped) push({ type: 'text', text: escaped.slice(1) });
		last = match.index + token.length;
	}
	if (last < text.length) push({ type: 'text', text: text.slice(last) });
	return out;
}

function lines(text: string): Inline[] {
	return text
		.split('\n')
		.flatMap((line, i) => [...(i ? [{ type: 'break' } as const] : []), ...parseInline(line)]);
}

type LineKind = 'text' | 'quote' | 'bullet' | 'number' | 'heading' | 'blank';

const BULLET = /^\s*[-*•]\s+/;
const NUMBER = /^\s*\d{1,3}[.)]\s+/;
const HEADING = /^#{1,3}\s+/;

const headingLevel = (line: string) =>
	Math.min(3, Math.max(1, line.match(/^#*/)![0].length)) as 1 | 2 | 3;

function kindOf(line: string): LineKind {
	if (!line.trim()) return 'blank';
	if (line.startsWith('>')) return 'quote';
	if (HEADING.test(line)) return 'heading';
	if (BULLET.test(line)) return 'bullet';
	if (NUMBER.test(line)) return 'number';
	return 'text';
}

const contentOf = (line: string, kind: LineKind) =>
	kind === 'quote'
		? line.replace(/^>\s?/, '')
		: kind === 'heading'
			? line.replace(HEADING, '')
			: kind === 'bullet'
				? line.replace(BULLET, '')
				: kind === 'number'
					? line.replace(NUMBER, '')
					: line;

/**
 * Light formatting, the way people already type it: `## titre`, `- liste`, `1. liste`,
 * `> citation`, `**gras**`. A blank line starts a new paragraph.
 */
function proseBlocks(text: string): Block[] {
	const groups: { kind: LineKind; level: 1 | 2 | 3; lines: string[] }[] = [];
	for (const line of text.split('\n')) {
		const kind = kindOf(line);
		const current = groups.at(-1);
		if (current && current.kind === kind && kind !== 'heading')
			current.lines.push(contentOf(line, kind));
		else groups.push({ kind, level: headingLevel(line), lines: [contentOf(line, kind)] });
	}
	return groups.flatMap((group): Block[] => {
		if (group.kind === 'blank') return [];
		if (group.kind === 'heading')
			return [{ type: 'heading', level: group.level, inlines: parseInline(group.lines[0]) }];
		if (group.kind === 'bullet' || group.kind === 'number')
			return [
				{ type: 'list', ordered: group.kind === 'number', items: group.lines.map(parseInline) }
			];
		const content = group.lines.join('\n').replace(/^\n+|\n+$/g, '');
		if (!content) return [];
		return [{ type: group.kind === 'quote' ? 'quote' : 'paragraph', inlines: lines(content) }];
	});
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
