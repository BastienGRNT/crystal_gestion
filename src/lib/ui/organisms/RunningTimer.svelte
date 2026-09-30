<script lang="ts">
	import { Check, Square } from '@lucide/svelte';
	import Elapsed from '../atoms/Elapsed.svelte';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		taskRef: string;
		taskTitle: string;
		startedAt: string;
		/** Set when the timer runs in another project than the one open. */
		projectName: string | null;
		onopen: () => void;
		onstop: () => void;
		onfinish?: () => void;
	}

	let { taskRef, taskTitle, startedAt, projectName, onopen, onstop, onfinish }: Props = $props();
</script>

<!-- The prism border is the app signature: it only ever appears around live work. -->
<div
	class="relative rounded-lg p-[1.5px] shadow-pop prism"
	role="status"
	aria-label="Chrono en cours"
>
	<div class="flex items-center gap-1 rounded-[8.5px] bg-surface py-2 pr-1.5 pl-3">
		<button class="min-w-0 flex-1 text-left" onclick={onopen} title="Ouvrir {taskRef}">
			<p class="flex items-center gap-1.5 text-xs text-ink-3">
				<span class="size-1.5 animate-pulse rounded-full bg-must"></span>
				<Elapsed since={startedAt} />
				<span class="truncate font-mono">{projectName ? `${projectName} · ` : ''}{taskRef}</span>
			</p>
			<p class="truncate text-sm font-medium">{taskTitle}</p>
		</button>
		<IconButton label="Arrêter le chrono" size="sm" onclick={onstop}
			><Square size={13} /></IconButton
		>
		{#if onfinish}
			<IconButton label="Terminer la tâche" size="sm" onclick={onfinish} class="hover:text-success"
				><Check size={15} /></IconButton
			>
		{/if}
	</div>
</div>
