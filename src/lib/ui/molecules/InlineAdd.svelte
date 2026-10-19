<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { tick } from 'svelte';

	interface Props {
		label: string;
		placeholder?: string;
		/** Returns true when the text was accepted (the field then clears for the next one). */
		onadd: (text: string) => boolean | void;
		hint?: string;
	}

	let { label, placeholder = 'Titre, puis Entrée', onadd, hint }: Props = $props();
	let editing = $state(false);
	let text = $state('');
	let input = $state<HTMLInputElement>();

	async function open() {
		editing = true;
		await tick();
		input?.focus();
	}

	function submit() {
		if (!text.trim()) return;
		if (onadd(text.trim()) !== false) text = '';
	}
</script>

{#if editing}
	<div class="rounded-lg border border-accent bg-surface p-1 shadow-raise ring-3 ring-accent-soft">
		<input
			bind:this={input}
			bind:value={text}
			{placeholder}
			aria-label={label}
			class="h-11 w-full bg-transparent px-2.5 text-base outline-none"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					submit();
				}
				if (e.key === 'Escape') {
					text = '';
					editing = false;
				}
			}}
			onblur={() => !text.trim() && (editing = false)}
		/>
		{#if hint}<p class="px-2 pb-1 text-xs text-ink-3">{hint}</p>{/if}
	</div>
{:else}
	<button
		type="button"
		onclick={open}
		class="flex h-10 w-full items-center gap-2 rounded-lg px-2.5 text-base text-ink-3 transition-colors hover:bg-hover hover:text-ink-2"
	>
		<Plus size={16} aria-hidden="true" />{label}
	</button>
{/if}
