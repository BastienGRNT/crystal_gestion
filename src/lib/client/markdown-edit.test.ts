import { describe, expect, it } from 'vitest';
import {
	continueList,
	currentFormat,
	insertLink,
	toggleBold,
	toggleLines,
	type Edit
} from './markdown-edit';

/** `|` marks the cursor, `[` and `]` a selection. */
function at(marked: string): Edit {
	const caret = marked.indexOf('|');
	if (caret >= 0) {
		const text = marked.replace('|', '');
		return { text, start: caret, end: caret };
	}
	const start = marked.indexOf('[');
	const end = marked.indexOf(']') - 1;
	return { text: marked.replace('[', '').replace(']', ''), start, end };
}

const show = ({ text, start, end }: Edit) =>
	start === end
		? `${text.slice(0, start)}|${text.slice(start)}`
		: `${text.slice(0, start)}[${text.slice(start, end)}]${text.slice(end)}`;

describe('toggleLines', () => {
	it('turns the line into a title, and back', () => {
		const once = toggleLines(at('Pour| qui'), 'h1');
		expect(show(once)).toBe('# Pour| qui');
		expect(show(toggleLines(once, 'h1'))).toBe('Pour| qui');
	});

	it('swaps one format for another', () => {
		expect(show(toggleLines(at('# Ti|tre'), 'h2'))).toBe('## Ti|tre');
		expect(show(toggleLines(at('- un|'), 'number'))).toBe('1. un|');
	});

	it('numbers each selected line and leaves blank lines alone', () => {
		const out = toggleLines(at('[un\n\ndeux\ntrois]'), 'number');
		expect(out.text).toBe('1. un\n\n2. deux\n3. trois');
	});

	it('only touches the selected lines', () => {
		expect(toggleLines(at('avant\n[un\ndeux]\naprès'), 'bullet').text).toBe(
			'avant\n- un\n- deux\naprès'
		);
	});

	it('starts a list on an empty line', () => {
		expect(show(toggleLines(at('texte\n|'), 'bullet'))).toBe('texte\n- |');
	});
});

describe('currentFormat', () => {
	it('reads the line holding the cursor', () => {
		expect(currentFormat(at('un\n## ti|tre'))).toBe('h2');
		expect(currentFormat(at('# un\nte|xte'))).toBeNull();
	});
});

describe('toggleBold', () => {
	it('wraps the selection without the trailing space', () => {
		expect(show(toggleBold(at('un [mot ]ici')))).toBe('un **[mot]** ici');
	});

	it('takes the word under the cursor, and unwraps it again', () => {
		const once = toggleBold(at('un m|ot'));
		expect(once.text).toBe('un **mot**');
		expect(toggleBold({ ...once, start: 6, end: 6 }).text).toBe('un mot');
	});

	it('leaves the cursor between the stars on an empty spot', () => {
		expect(show(toggleBold(at('un |')))).toBe('un **|**');
	});

	it('wraps each line apart', () => {
		expect(toggleBold(at('[un\ndeux]')).text).toBe('**un**\n**deux**');
	});
});

describe('insertLink', () => {
	it('puts the address after the selected words', () => {
		expect(show(insertLink(at('voir [la doc]')))).toBe('voir la doc https://|');
	});
});

describe('continueList', () => {
	it('starts the next item', () => {
		expect(show(continueList(at('- un|'))!)).toBe('- un\n- |');
		expect(show(continueList(at('9. neuf|'))!)).toBe('9. neuf\n10. |');
	});

	it('leaves the list on an empty item', () => {
		expect(show(continueList(at('- un\n- |'))!)).toBe('- un\n|');
	});

	it('does nothing outside a list', () => {
		expect(continueList(at('texte|'))).toBeNull();
		expect(continueList(at('# titre|'))).toBeNull();
	});
});
