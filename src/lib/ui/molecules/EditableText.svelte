<script lang="ts">
	import { tick } from 'svelte';

	interface Props {
		label: string;
		value: string;
		placeholder?: string;
		maxlength?: number;
		/** Called on Enter or on leaving, only when the text changed and is not empty. */
		onsave: (value: string) => void;
		class?: string;
	}

	let {
		label,
		value,
		placeholder = '',
		maxlength = 200,
		onsave,
		class: extra = ''
	}: Props = $props();
	let editing = $state(false);
	let draft = $state('');
	let input = $state<HTMLInputElement>();

	async function edit() {
		draft = value;
		editing = true;
		await tick();
		input?.select();
	}

	function save() {
		editing = false;
		const text = draft.trim();
		if (text && text !== value) onsave(text);
	}
</script>

{#if editing}
	<input
		bind:this={input}
		bind:value={draft}
		aria-label={label}
		{maxlength}
		{placeholder}
		class={[
			'-mx-2 h-11 w-[calc(100%+1rem)] min-w-0 rounded-lg border border-accent bg-surface px-2 ring-3 ring-accent-soft outline-none',
			extra
		]}
		onblur={save}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				e.currentTarget.blur();
			}
			if (e.key === 'Escape') {
				draft = value;
				e.currentTarget.blur();
			}
		}}
	/>
{:else}
	<button
		type="button"
		aria-label="{label} : modifier"
		class={[
			'-mx-2 min-h-10 max-w-full cursor-text rounded-lg px-2 text-left transition-colors hover:bg-hover',
			extra
		]}
		onclick={edit}>{value || placeholder}</button
	>
{/if}
