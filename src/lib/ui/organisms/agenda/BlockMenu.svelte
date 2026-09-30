<script lang="ts">
	import { Link2Off, Trash2 } from '@lucide/svelte';
	import MenuItem from '$lib/ui/molecules/MenuItem.svelte';
	import TaskSearch from './TaskSearch.svelte';

	type TaskOption = { id: string; ref: string; title: string };
	interface Props {
		tasks: TaskOption[];
		linked: TaskOption | null;
		onlink: (taskId: string | null) => void;
		onremove: () => void;
	}

	let { tasks, linked, onlink, onremove }: Props = $props();
</script>

{#if linked}
	<MenuItem onclick={() => onlink(null)}>
		<Link2Off size={14} /> Délier <span class="font-mono text-2xs text-ink-3">{linked.ref}</span>
	</MenuItem>
{/if}
<TaskSearch tasks={tasks.filter((task) => task.id !== linked?.id)} onpick={onlink} />
<div class="mt-1 border-t border-line pt-1">
	<MenuItem tone="danger" onclick={onremove}><Trash2 size={14} /> Supprimer</MenuItem>
</div>
