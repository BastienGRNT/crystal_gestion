<script lang="ts">
	import { Plus } from '@lucide/svelte';

	interface Props {
		label: string;
		placeholder?: string;
		onadd: (text: string) => void;
		/** Inside a card: a full-width row like the task rows. */
		row?: boolean;
	}

	/** « + Ajouter… » that turns into a field and stays open: type, Enter, type the next one. */
	let { label, placeholder = label, onadd, row = false }: Props = $props();
	let editing = $state(false);
	let text = $state('');
	const box = $derived(row ? 'h-[52px] px-5' : 'h-10 rounded-[10px] px-3');

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && text.trim()) {
			onadd(text.trim());
			text = '';
		}
		if (event.key === 'Escape') [text, editing] = ['', false];
	}
</script>

{#if editing}
	<div class="flex items-center gap-3 bg-surface-2 {box}">
		<Plus size={18} class="shrink-0 text-accent" />
		<!-- svelte-ignore a11y_autofocus -->
		<input
			bind:value={text}
			autofocus
			onkeydown={keydown}
			onblur={() => !text.trim() && (editing = false)}
			{placeholder}
			aria-label={label}
			class="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
		/>
		<span class="hidden text-xs text-ink-3 sm:inline">Entrée pour ajouter · Échap pour finir</span>
	</div>
{:else}
	<button
		type="button"
		onclick={() => (editing = true)}
		class="flex w-full items-center gap-3 text-[15px] font-semibold text-ink-3 transition hover:bg-hover hover:text-ink {box}"
	>
		<Plus size={18} />{label}
	</button>
{/if}
