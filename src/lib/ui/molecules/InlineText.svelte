<script lang="ts">
	interface Props {
		value: string;
		onsave: (value: string) => void;
		placeholder?: string;
		class?: string;
		required?: boolean;
	}

	let { value, onsave, placeholder = '', class: extra = '', required = true }: Props = $props();
	let draft = $state('');
	let editing = $state(false);

	function start() {
		draft = value;
		editing = true;
	}

	function commit() {
		editing = false;
		const next = draft.trim();
		if (next !== value && (next || !required)) onsave(next);
	}
</script>

<!-- While editing, the local draft wins over realtime updates: nobody loses what they are typing. -->
{#if editing}
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={draft}
		autofocus
		onblur={commit}
		onkeydown={(event) => {
			if (event.key === 'Enter') commit();
			if (event.key === 'Escape') editing = false;
		}}
		class="-mx-1 w-full rounded-md bg-sunken/60 px-1 ring-2 ring-accent/30 outline-none {extra}"
		{placeholder}
	/>
{:else}
	<button
		type="button"
		onclick={start}
		class="-mx-1 w-full rounded-md px-1 text-left transition hover:bg-sunken/60 {extra} {value
			? ''
			: 'text-ink-3'}"
	>
		{value || placeholder}
	</button>
{/if}
