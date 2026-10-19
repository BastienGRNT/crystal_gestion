<script lang="ts">
	import { onMount, tick } from 'svelte';
	import TextArea from '../atoms/TextArea.svelte';
	import RichText from '../organisms/RichText.svelte';

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
</script>

<div class="flex flex-col gap-1">
	{#if showLabel}<span class="text-sm font-semibold text-ink-2">{label}</span>{/if}
	{#if editing}
		<TextArea
			bind:element={input}
			bind:value={draft}
			aria-label={label}
			{maxlength}
			{placeholder}
			rows={2}
			maxHeight={520}
			onblur={save}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					draft = value;
					e.currentTarget.blur();
				}
				if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.blur();
			}}
		/>
		<p class="text-xs text-ink-3">
			Entrée pour aller à la ligne · « - » liste · « ## » titre · **gras** · Ctrl+Entrée ou clic
			ailleurs pour enregistrer
		</p>
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
