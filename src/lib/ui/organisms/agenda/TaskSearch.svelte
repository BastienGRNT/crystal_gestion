<script lang="ts">
	import { Search } from '@lucide/svelte';

	type TaskOption = { id: string; ref: string; title: string };
	let { tasks, onpick }: { tasks: TaskOption[]; onpick: (id: string) => void } = $props();
	let query = $state('');
	const needle = $derived(query.trim().toLowerCase());
	const matches = $derived(
		tasks.filter((task) => `${task.ref} ${task.title}`.toLowerCase().includes(needle)).slice(0, 6)
	);
</script>

<label class="mx-1 my-1 flex items-center gap-2 rounded-md bg-sunken px-2 text-ink-3">
	<Search size={13} />
	<!-- Focus straight away with a mouse; on touch it would pop the keyboard over the agenda. -->
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={query}
		autofocus={matchMedia('(pointer: fine)').matches}
		placeholder="Lier une Task…"
		class="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
	/>
</label>
{#each matches as task (task.id)}
	<button
		type="button"
		class="flex w-full items-baseline gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-2 hover:bg-sunken hover:text-ink"
		onclick={() => onpick(task.id)}
	>
		<span class="shrink-0 font-mono text-2xs text-ink-3">{task.ref}</span>
		<span class="truncate">{task.title}</span>
	</button>
{:else}
	<p class="px-2.5 py-1.5 text-sm text-ink-3">Aucune Task trouvée</p>
{/each}
