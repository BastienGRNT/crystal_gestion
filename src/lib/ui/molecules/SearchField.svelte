<script lang="ts">
	import { Search, X } from '@lucide/svelte';

	let { value = $bindable(''), placeholder }: { value?: string; placeholder: string } = $props();
</script>

<label
	class="flex h-8 min-w-0 items-center gap-2 rounded-md border border-line bg-surface px-2.5 text-sm transition focus-within:border-accent hover:border-line-strong"
>
	<Search size={14} class="shrink-0 text-ink-3" />
	<input
		bind:value
		{placeholder}
		type="search"
		class="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden"
	/>
	{#if value}
		<button
			type="button"
			onclick={() => (value = '')}
			aria-label="Effacer"
			class="text-ink-3 hover:text-ink"
		>
			<X size={13} />
		</button>
	{/if}
</label>
