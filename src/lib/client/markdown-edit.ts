/**
 * The toolbar of a text field: each button rewrites the text around the selection, so nobody has
 * to remember `##` or `- `. Pure functions on (text, selection), tested apart from the field.
 */
export interface Edit {
	text: string;
	start: number;
	end: number;
}

export type LineFormat = 'h1' | 'h2' | 'bullet' | 'number' | 'quote';

const PREFIX: Record<LineFormat, RegExp> = {
	h1: /^#\s+/,
	h2: /^#{2,3}\s+/,
	bullet: /^\s*[-*•]\s+/,
	number: /^\s*\d{1,3}[.)]\s+/,
	quote: /^>\s?/
};
const ANY_PREFIX = /^(#{1,3}\s+|\s*[-*•]\s+|\s*\d{1,3}[.)]\s+|>\s?)/;
const FORMATS = Object.keys(PREFIX) as LineFormat[];

const prefixFor = (format: LineFormat, i: number) =>
	({ h1: '# ', h2: '## ', bullet: '- ', number: `${i + 1}. `, quote: '> ' })[format];

/** The whole lines the selection touches. */
function lineRange({ text, start, end }: Edit) {
	const from = text.lastIndexOf('\n', start - 1) + 1;
	// A selection ending right after a line break does not take the next line.
	const last = end > start && text[end - 1] === '\n' ? end - 1 : end;
	const next = text.indexOf('\n', last);
	return { from, to: next === -1 ? text.length : next };
}

export function lineFormat(line: string): LineFormat | null {
	return FORMATS.find((f) => PREFIX[f].test(line)) ?? null;
}

/** The format of the line holding the cursor, to show its button pressed. */
export function currentFormat(edit: Edit): LineFormat | null {
	const { from, to } = lineRange({ ...edit, end: edit.start });
	return lineFormat(edit.text.slice(from, to));
}

/** Sets the lines as a title, a list or a quote; pressing again on such lines removes it. */
export function toggleLines(edit: Edit, format: LineFormat): Edit {
	const { from, to } = lineRange(edit);
	const lines = edit.text.slice(from, to).split('\n');
	const filled = lines.filter((l) => l.trim());
	const remove = filled.length > 0 && filled.every((l) => lineFormat(l) === format);
	let n = 0;
	const next = lines.map((line) => {
		const bare = line.replace(ANY_PREFIX, '');
		if (remove) return bare;
		if (!line.trim() && lines.length > 1) return line;
		return prefixFor(format, n++) + bare;
	});
	const block = next.join('\n');
	const text = edit.text.slice(0, from) + block + edit.text.slice(to);
	if (lines.length > 1) return { text, start: from, end: from + block.length };
	// One line: the cursor stays on the same word, never inside the prefix.
	const shift = next[0].length - lines[0].length;
	const head = from + (next[0].length - next[0].replace(ANY_PREFIX, '').length);
	const move = (i: number) => Math.max(head, i + shift);
	return { text, start: move(edit.start), end: move(edit.end) };
}

const WORD = /[\p{L}\p{N}_'’-]/u;

/** Wraps the selection (or the word under the cursor) in `**`, or unwraps it. */
export function toggleBold(edit: Edit): Edit {
	let { start, end } = edit;
	const { text } = edit;
	if (start === end) {
		while (start > 0 && WORD.test(text[start - 1])) start--;
		while (end < text.length && WORD.test(text[end])) end++;
	}
	// A double-click takes the space after the word: it stays outside.
	while (end > start && /\s/.test(text[end - 1])) end--;
	while (start < end && /\s/.test(text[start])) start++;

	if (text.slice(start - 2, start) === '**' && text.slice(end, end + 2) === '**')
		return {
			text: text.slice(0, start - 2) + text.slice(start, end) + text.slice(end + 2),
			start: start - 2,
			end: end - 2
		};
	const inner = text.slice(start, end);
	if (inner.length > 4 && inner.startsWith('**') && inner.endsWith('**'))
		return {
			text: text.slice(0, start) + inner.slice(2, -2) + text.slice(end),
			start,
			end: end - 4
		};
	if (!inner) {
		const at = edit.start;
		return { text: `${text.slice(0, at)}****${text.slice(at)}`, start: at + 2, end: at + 2 };
	}
	// Bold never spans a line break: each line gets its own pair.
	const wrapped = inner
		.split('\n')
		.map((l) => (l.trim() ? `**${l}**` : l))
		.join('\n');
	return {
		text: text.slice(0, start) + wrapped + text.slice(end),
		start: inner.includes('\n') ? start : start + 2,
		end: inner.includes('\n') ? start + wrapped.length : end + 2
	};
}

/** Wraps the selection as a link and selects `url` to type over. */
export function insertLink(edit: Edit): Edit {
	const { text, start, end } = edit;
	const label = text.slice(start, end);
	if (/^https?:\/\/\S+$/.test(label)) return edit;
	const before = text.slice(0, start);
	const space = before && !/\s$/.test(before) ? ' ' : '';
	const inserted = `${space}${label ? `${label} ` : ''}https://`;
	const at = start + inserted.length;
	return { text: before + inserted + text.slice(end), start: at, end: at };
}

/**
 * Enter inside a list starts the next item; Enter on an empty item leaves the list.
 * `null` when Enter should just go to the line.
 */
export function continueList(edit: Edit): Edit | null {
	const { text, start, end } = edit;
	if (start !== end) return null;
	const { from, to } = lineRange(edit);
	const line = text.slice(from, to);
	const match = line.match(/^(\s*)(?:([-*•])|(\d{1,3})([.)]))\s+|^>\s?/);
	if (!match || start < from + match[0].length) return null;
	if (!line.slice(match[0].length).trim())
		return { text: text.slice(0, from) + text.slice(to), start: from, end: from };
	const [, indent = '', bullet, number, dot] = match;
	const prefix = bullet
		? `${indent}${bullet} `
		: number
			? `${indent}${Number(number) + 1}${dot} `
			: '> ';
	const at = start + 1 + prefix.length;
	return { text: `${text.slice(0, start)}\n${prefix}${text.slice(start)}`, start: at, end: at };
}
