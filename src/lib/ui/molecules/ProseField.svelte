<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		continueList,
		currentFormat,
		insertLink,
		toggleBold,
		toggleLines,
		type Edit,
		type LineFormat
	} from '$lib/client/markdown-edit';
	import TextArea from '../atoms/TextArea.svelte';
	import RichText from '../organisms/RichText.svelte';
	import MarkdownToolbar from './MarkdownToolbar.svelte';

	interface Props {
		/** What the field is, for screen readers (and shown above when `label` is visible). */
		label: string;
		value: string;
		placeholder: string;
		maxlength?: number;
		/** Called on leaving the field, only when the text changed. */
		onsave: (value: string) => void;
		/** Shows the label above the text. */
		showLabel?: boolean;
		size?: 'md' | 'base';
		/** Opens straight in the editor (right after "Écrire…"). */
		startEditing?: boolean;
	}

	let {
		label,
		value,
		placeholder,
		maxlength = 5000,
		onsave,
		showLabel = false,
		size = 'base',
		startEditing = false
	}: Props = $props();
	let editing = $state(false);
	let draft = $state('');
	let input = $state<HTMLTextAreaElement>();

	async function edit(event?: MouseEvent) {
		// A link inside the text opens the link, not the editor.
		if ((event?.target as HTMLElement | undefined)?.closest('a, button')) return;
		draft = value;
		editing = true;
		await tick();
		input?.focus();
		input?.setSelectionRange(draft.length, draft.length);
	}

	onMount(() => {
		if (startEditing) void edit();
	});

	function save() {
		editing = false;
		if (draft.trim() !== value.trim()) onsave(draft.trim());
	}

	let current = $state<LineFormat | null>(null);
	const selection = (el: HTMLTextAreaElement): Edit => ({
		text: el.value,
		start: el.selectionStart,
		end: el.selectionEnd
	});
	const follow = () => {
		if (input) current = currentFormat(selection(input));
	};

	/**
	 * Writes only the part that changed, as typing would: Ctrl+Z undoes a button like a keystroke.
	 */
	function apply(change: (edit: Edit) => Edit | null) {
		if (!input) return false;
		const before = input.value;
		const next = change(selection(input));
		if (!next) return false;
		let head = 0;
		while (head < before.length && before[head] === next.text[head]) head++;
		let tail = 0;
		while (
			tail < before.length - head &&
			tail < next.text.length - head &&
			before.at(-1 - tail) === next.text.at(-1 - tail)
		)
			tail++;
		input.focus();
		input.setSelectionRange(head, before.length - tail);
		const inserted = next.text.slice(head, next.text.length - tail);
		const typed = document.execCommand(inserted ? 'insertText' : 'delete', false, inserted);
		if (!typed || input.value !== next.text) input.value = next.text;
		draft = next.text;
		input.setSelectionRange(next.start, next.end);
		follow();
		return true;
	}

	function keydown(e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
		const mod = e.metaKey || e.ctrlKey;
		if (e.key === 'Escape') {
			draft = value;
			e.currentTarget.blur();
		} else if (e.key === 'Enter' && mod) e.currentTarget.blur();
		else if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
			if (apply(continueList)) e.preventDefault();
		} else if (mod && e.key.toLowerCase() === 'b') {
			e.preventDefault();
			apply(toggleBold);
		}
	}

	/** Leaving the field saves; moving between the text and its toolbar does not. */
	function focusout(e: FocusEvent & { currentTarget: HTMLElement }) {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) save();
	}
</script>

<div class="flex flex-col gap-1">
	{#if showLabel}<span class="text-sm font-semibold text-ink-2">{label}</span>{/if}
	{#if editing}
		<div class="flex flex-col gap-1" onfocusout={focusout}>
			<MarkdownToolbar
				{current}
				onbold={() => apply(toggleBold)}
				onlink={() => apply(insertLink)}
				onformat={(format) => apply((edit) => toggleLines(edit, format))}
			/>
			<TextArea
				bind:element={input}
				bind:value={draft}
				aria-label={label}
				{maxlength}
				{placeholder}
				rows={5}
				maxHeight={520}
				onkeydown={keydown}
				onkeyup={follow}
				onclick={follow}
				onfocus={follow}
			/>
			<p class="text-xs text-ink-3">Ctrl+Entrée ou clic ailleurs pour enregistrer · Échap annule</p>
		</div>
	{:else}
		<div
			role="button"
			tabindex="0"
			aria-label="{label} : modifier"
			class="-mx-2 min-h-11 cursor-text rounded-lg px-2 py-1.5 transition-colors hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
			onclick={edit}
			onkeydown={(e) => {
				if (e.key === 'Enter' && e.target === e.currentTarget) {
					e.preventDefault();
					edit();
				}
			}}
		>
			{#if value.trim()}
				<RichText body={value} {size} />
			{:else}
				<p class={['text-ink-4', size === 'md' ? 'text-md' : 'text-base']}>{placeholder}</p>
			{/if}
		</div>
	{/if}
</div>
