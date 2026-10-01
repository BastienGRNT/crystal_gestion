<script lang="ts">
	import { Plus } from '@lucide/svelte';

	interface Props {
		label: string;
		placeholder?: string;
		onadd: (text: string) => void;
	}

	/** « + Ajouter » that turns into a field and stays open: type, Enter, type the next one. */
	let { label, placeholder = label, onadd }: Props = $props();
	let editing = $state(false);
	let text = $state('');

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && text.trim()) {
			onadd(text.trim());
			text = '';
		}
		if (event.key === 'Escape') [text, editing] = ['', false];
	}
</script>

{#if editing}
	<div class="flex h-10 items-center gap-2.5 rounded-lg bg-hover pr-2 pl-2">
		<Plus size={16} class="shrink-0 text-accent" />
		<!-- svelte-ignore a11y_autofocus -->
		<input
			bind:value={text}
			autofocus
			onkeydown={keydown}
			onblur={() => !text.trim() && (editing = false)}
			{placeholder}
			aria-label={label}
			class="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-3"
		/>
		<span class="hidden text-2xs text-ink-3 sm:inline">Entrée · Échap pour finir</span>
	</div>
{:else}
	<button
		type="button"
		onclick={() => (editing = true)}
		class="flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-ui text-ink-3 transition hover:bg-hover hover:text-ink"
	>
		<Plus size={16} />{label}
	</button>
{/if}
