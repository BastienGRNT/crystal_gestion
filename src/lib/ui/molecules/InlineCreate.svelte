<script lang="ts">
	import { Plus } from '@lucide/svelte';

	interface Props {
		label: string;
		placeholder: string;
		oncreate: (name: string) => void;
	}

	/** A button that turns into a name field: Enter creates, Escape cancels. */
	let { label, placeholder, oncreate }: Props = $props();
	let editing = $state(false);
	let name = $state('');

	function submit() {
		if (name.trim()) oncreate(name.trim());
		[name, editing] = ['', false];
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') submit();
		if (event.key === 'Escape') [name, editing] = ['', false];
	}
</script>

{#if editing}
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={name}
		autofocus
		onkeydown={keydown}
		onblur={submit}
		{placeholder}
		aria-label={placeholder}
		class="h-8 w-full rounded-md border border-accent bg-surface px-2.5 text-sm outline-none"
	/>
{:else}
	<button
		type="button"
		onclick={() => (editing = true)}
		class="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-ink-3 transition hover:bg-sunken hover:text-ink"
	>
		<Plus size={14} />
		{label}
	</button>
{/if}
