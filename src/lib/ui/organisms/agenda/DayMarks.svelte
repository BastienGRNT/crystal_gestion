<script lang="ts">
	import { Check, Flag } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import type { DayMark } from './types';

	const soft = (color: string, percent: number) =>
		`color-mix(in oklch, ${color} ${percent}%, transparent)`;

	let { marks, onmark }: { marks: DayMark[]; onmark?: (ref: string) => void } = $props();
	let all = $state(false);
	const shown = $derived(all ? marks : marks.slice(0, 3));
</script>

<!-- Above the hours: planned ends (flag) and finished tasks (check, with who). -->
<div class="mt-1.5 flex min-h-5 flex-col gap-0.5 text-left">
	{#each shown as mark (mark.id)}
		<button
			type="button"
			onclick={() => onmark?.(mark.ref)}
			title="{mark.kind === 'due' ? 'Échéance' : 'Fini'} : {mark.title}{mark.person
				? ` (${mark.person.name})`
				: ''}"
			class="flex h-5 w-full min-w-0 items-center gap-1 rounded-[5px] px-1 text-xs transition hover:brightness-95 {mark.late
				? 'text-now-text'
				: 'text-ink-2'}"
			style="background:{soft(mark.color, mark.kind === 'done' ? 10 : 18)}"
		>
			{#if mark.kind === 'done'}
				{#if mark.person}<Avatar
						name={mark.person.name}
						color={mark.person.colorIndex}
						size="xs"
					/>{/if}
				<Check size={11} class="shrink-0 text-ok" />
			{:else}<Flag size={10} class="shrink-0" />{/if}
			<span class="truncate {mark.kind === 'done' ? 'line-through decoration-ink-3/50' : ''}"
				>{mark.title}</span
			>
		</button>
	{/each}
	{#if marks.length > 3 && !all}
		<button type="button" onclick={() => (all = true)} class="text-xs text-ink-3 hover:text-ink"
			>+{marks.length - 3}</button
		>
	{/if}
</div>
