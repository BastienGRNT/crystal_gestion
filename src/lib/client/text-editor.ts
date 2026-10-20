import { Editor } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import type { TextFormat } from '$lib/ui/types';

/**
 * The text editor of long texts: what you see is what you get (bold shows bold, never `**`),
 * and the text is still stored as Markdown, so `RichText`, exports and search read it as before.
 */
export function createTextEditor(options: {
	element: HTMLElement;
	markdown: string;
	placeholder: string;
	label: string;
	onchange: () => void;
}) {
	return new Editor({
		element: options.element,
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
				codeBlock: false,
				code: false,
				strike: false,
				underline: false,
				horizontalRule: false,
				link: { openOnClick: false, autolink: true, defaultProtocol: 'https' }
			}),
			Markdown
		],
		content: options.markdown,
		contentType: 'markdown',
		editorProps: {
			attributes: {
				'aria-label': options.label,
				'aria-multiline': 'true',
				role: 'textbox',
				'data-placeholder': options.placeholder,
				class: 'prose-editor'
			}
		},
		onTransaction: options.onchange
	});
}

export const markdownOf = (editor: Editor) => editor.getMarkdown().trim();

export function activeFormats(editor: Editor): Set<TextFormat> {
	const on = new Set<TextFormat>();
	if (editor.isActive('bold')) on.add('bold');
	if (editor.isActive('italic')) on.add('italic');
	if (editor.isActive('heading', { level: 1 })) on.add('h1');
	if (editor.isActive('heading', { level: 2 })) on.add('h2');
	if (editor.isActive('bulletList')) on.add('bullet');
	if (editor.isActive('orderedList')) on.add('number');
	if (editor.isActive('blockquote')) on.add('quote');
	if (editor.isActive('link')) on.add('link');
	return on;
}

/** Every button but the link one, which first asks for the address. */
export function toggleFormat(editor: Editor, format: Exclude<TextFormat, 'link'>) {
	const chain = editor.chain().focus();
	({
		bold: () => chain.toggleBold(),
		italic: () => chain.toggleItalic(),
		h1: () => chain.toggleHeading({ level: 1 }),
		h2: () => chain.toggleHeading({ level: 2 }),
		bullet: () => chain.toggleBulletList(),
		number: () => chain.toggleOrderedList(),
		quote: () => chain.toggleBlockquote()
	})
		[format]()
		.run();
}

/** An empty address removes the link. Without a selection, the address becomes the text. */
export function setLink(editor: Editor, address: string) {
	const href = address.trim();
	const chain = editor.chain().focus().extendMarkRange('link');
	if (!href) return void chain.unsetLink().run();
	const url = /^[a-z]+:\/\//i.test(href) ? href : `https://${href}`;
	if (editor.state.selection.empty && !editor.isActive('link'))
		chain
			.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href: url } }] })
			.run();
	else chain.setLink({ href: url }).run();
}
