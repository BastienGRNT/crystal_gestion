<script lang="ts">
	import { Check, Lightbulb } from '@lucide/svelte';
	import type { TaskStatus } from '$lib/modules/tasks/domain/task';

	interface Props {
		status: TaskStatus;
		title: string;
		oncomplete: () => void;
		onreopen?: () => void;
		size?: 'sm' | 'md';
	}

	let { status, title, oncomplete, onreopen, size = 'md' }: Props = $props();
	const done = $derived(status === 'done');
	const box = $derived(size === 'sm' ? 'size-[18px]' : 'size-5');
</script>

{#if status === 'idea'}
	<span class={['flex shrink-0 items-center justify-center text-warn', box]} aria-hidden="true">
		<Lightbulb size={16} />
	</span>
{:else}
	<button
		type="button"
		data-no-drag
		aria-label={done ? `Rouvrir « ${title} »` : `Marquer « ${title} » comme fait`}
		onclick={(event) => {
			event.stopPropagation();
			if (done) onreopen?.();
			else oncomplete();
		}}
		class={[
			'group/check relative flex shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all',
			box,
			done
				? 'border-ok bg-ok text-white'
				: status === 'doing'
					? 'border-accent text-accent hover:bg-accent-soft'
					: 'border-ink-4 text-transparent hover:border-ok hover:text-ok'
		]}
	>
		{#if status === 'doing' && !done}
			<span
				class="absolute inset-[3px] rounded-full bg-[conic-gradient(currentColor_0_50%,transparent_50%)] group-hover/check:hidden"
			></span>
		{/if}
		<Check
			size={size === 'sm' ? 11 : 12}
			strokeWidth={3.2}
			class={status === 'doing' && !done ? 'hidden group-hover/check:block' : ''}
		/>
	</button>
{/if}
