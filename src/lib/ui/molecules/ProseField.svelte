<script lang="ts">
	import type { Editor } from '@tiptap/core';
	import { onMount, tick, untrack } from 'svelte';
	import {
		activeFormats,
		createTextEditor,
		markdownOf,
		setLink,
		toggleFormat
	} from '$lib/client/text-editor';
	import RichText from '../organisms/RichText.svelte';
	import type { TextFormat } from '../types';
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
	let editor: Editor | null = null;
	let active = $state(new Set<TextFormat>());
	let tooLong = $state(false);
	let linking = $state(false);
	let address = $state('');
	let addressInput = $state<HTMLInputElement>();

	async function edit(event?: MouseEvent) {
		// A link inside the text opens the link, not the editor.
		if ((event?.target as HTMLElement | undefined)?.closest('a, button')) return;
		editing = true;
	}

	onMount(() => {
		if (startEditing) editing = true;
	});

	/**
	 * Mounts the editor where the text was, cursor at the end. Read once (`untrack`): a live update
	 * of the value must not rebuild the editor under the cursor. The toolbar state is written
	 * after the editor's own transaction, never during the attachment.
	 */
	function mount(element: HTMLElement) {
		let alive = true;
		const instance = untrack(() =>
			createTextEditor({
				element,
				markdown: value,
				placeholder,
				label,
				onchange: () =>
					queueMicrotask(() => {
						// Destroying the editor emits a last transaction, after the field is gone.
						if (!alive) return;
						active = activeFormats(instance);
						tooLong = instance.getText().length > maxlength;
					})
			})
		);
		editor = instance;
		instance.commands.focus('end');
		return () => {
			alive = false;
			instance.destroy();
			if (editor === instance) editor = null;
		};
	}

	function close(keep: boolean) {
		const text = editor ? markdownOf(editor) : value;
		editing = false;
		linking = false;
		if (keep && !tooLong && text !== value.trim()) onsave(text);
	}

	async function format(which: TextFormat) {
		if (!editor) return;
		if (which !== 'link') return toggleFormat(editor, which);
		address = editor.getAttributes('link').href ?? '';
		linking = true;
		await tick();
		addressInput?.focus();
	}

	function applyLink() {
		if (editor) setLink(editor, address);
		linking = false;
	}

	function keydown(e: KeyboardEvent) {
		const mod = e.metaKey || e.ctrlKey;
		if (e.key === 'Escape' && !linking) {
			e.preventDefault();
			close(false);
		} else if (e.key === 'Enter' && mod) {
			e.preventDefault();
			close(true);
		} else if (mod && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			void format('link');
		}
	}

	/** Leaving the field saves; moving between the text and its toolbar does not. */
	function focusout(e: FocusEvent & { currentTarget: HTMLElement }) {
		if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close(true);
	}
</script>

<div class="flex flex-col gap-1">
	{#if showLabel}<span class="text-sm font-semibold text-ink-2">{label}</span>{/if}
	{#if editing}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="flex flex-col gap-1" onfocusout={focusout} onkeydown={keydown}>
			<MarkdownToolbar {active} onformat={format} />
			{#if linking}
				<div class="flex items-center gap-2">
					<input
						bind:this={addressInput}
						bind:value={address}
						aria-label="Adresse du lien"
						placeholder="https://… (vide pour retirer le lien)"
						class="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 text-sm focus:border-accent focus:outline-none"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								applyLink();
							} else if (e.key === 'Escape') {
								e.preventDefault();
								linking = false;
								editor?.commands.focus();
							}
						}}
					/>
				</div>
			{/if}
			<div
				{@attach mount}
				class={[
					'prose-field max-h-[520px] scrollbar-thin overflow-y-auto rounded-xl border bg-surface px-3 py-2 leading-relaxed text-ink',
					tooLong ? 'border-danger' : 'border-line-strong focus-within:border-accent',
					size === 'md' ? 'text-md' : 'text-base'
				]}
			></div>
			<p class={['text-xs', tooLong ? 'text-danger-text' : 'text-ink-3']}>
				{tooLong
					? `Trop long : ${maxlength} caractères au plus.`
					: 'Ctrl+Entrée ou clic ailleurs pour enregistrer · Échap annule'}
			</p>
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
