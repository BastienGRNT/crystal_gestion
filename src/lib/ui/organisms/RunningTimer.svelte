<script lang="ts">
	import { Check, Pause } from '@lucide/svelte';
	import Elapsed from '../atoms/Elapsed.svelte';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		taskRef: string;
		taskTitle: string;
		startedAt: string;
		onopen: () => void;
		onpause: () => void;
		onfinish: () => void;
	}

	let { taskRef, taskTitle, startedAt, onopen, onpause, onfinish }: Props = $props();
</script>

<!-- The prism border is the app signature: it only ever appears around live work. -->
<div class="relative rounded-lg p-[1.5px] shadow-pop prism">
	<div class="flex items-center gap-2 rounded-[8.5px] bg-surface py-2 pr-1.5 pl-3">
		<button class="min-w-0 flex-1 text-left" onclick={onopen}>
			<p class="flex items-center gap-1.5 text-[11px] text-ink-3">
				<span class="size-1.5 animate-pulse rounded-full bg-must"></span>
				<span class="font-mono">{taskRef}</span>
				<Elapsed since={startedAt} />
			</p>
			<p class="truncate text-[13px] font-medium">{taskTitle}</p>
		</button>
		<IconButton label="Pause" size="sm" onclick={onpause}><Pause size={14} /></IconButton>
		<IconButton label="Terminer" size="sm" onclick={onfinish} class="hover:text-success"
			><Check size={15} /></IconButton
		>
	</div>
</div>
