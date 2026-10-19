<script lang="ts">
	import { Search } from '@lucide/svelte';

	type TaskOption = { id: string; ref: string; title: string };
	interface Props {
		tasks: TaskOption[];
		onpick: (id: string) => void;
		/** How many tasks to list before anything is typed. */
		idle?: number;
	}

	let { tasks, onpick, idle = 6 }: Props = $props();
	let query = $state('');
	const needle = $derived(query.trim().toLowerCase());
	const matches = $derived(
		tasks
			.filter((task) => `${task.ref} ${task.title}`.toLowerCase().includes(needle))
			.slice(0, needle ? 6 : idle)
	);
</script>

<label class="mx-1 my-1 flex items-center gap-2 rounded-md bg-sunken px-2.5 text-ink-3">
	<Search size={15} />
	<!-- Focus straight away with a mouse; on touch it would pop the keyboard over the agenda. -->
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value={query}
		autofocus={matchMedia('(pointer: fine)').matches}
		placeholder="Chercher une tâche…"
		class="h-10 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
	/>
</label>
{#each matches as task (task.id)}
	<button
		type="button"
		class="flex h-10 w-full items-center gap-2 rounded-md px-2.5 text-left text-base text-ink-2 hover:bg-sunken hover:text-ink"
		onclick={() => onpick(task.id)}
	>
		<span class="shrink-0 font-mono text-sm text-ink-3">{task.ref}</span>
		<span class="truncate">{task.title}</span>
	</button>
{:else}
	{#if needle || idle}<p class="px-2.5 py-2 text-sm text-ink-3">Aucune tâche trouvée</p>{/if}
{/each}
