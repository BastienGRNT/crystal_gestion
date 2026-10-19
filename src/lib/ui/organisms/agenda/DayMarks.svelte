<script lang="ts">
	import { CalendarClock, Check, Flag, Rocket } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import type { DayMark } from './types';

	const soft = (color: string, percent: number) =>
		`color-mix(in oklch, ${color} ${percent}%, transparent)`;
	const ICONS = { due: CalendarClock, step: Flag, release: Rocket, done: Check };
	const WORDS = { due: 'Échéance', step: 'Étape', release: 'Mise en prod', done: 'Fini' };

	let { marks, onmark }: { marks: DayMark[]; onmark?: (mark: DayMark) => void } = $props();
	let all = $state(false);
	const shown = $derived(all ? marks : marks.slice(0, 3));
</script>

<!-- Above the hours: what is due, the end of a step, a release, and what got finished (by whom). -->
<div class="mt-1.5 flex min-h-7 flex-col gap-0.5 text-left">
	{#each shown as mark (mark.id)}
		{@const Icon = ICONS[mark.kind]}
		<button
			type="button"
			onclick={() => onmark?.(mark)}
			title="{WORDS[mark.kind]} : {mark.title}{mark.person ? ` (${mark.person.name})` : ''}"
			class="flex h-7 w-full min-w-0 items-center gap-1 rounded-md px-1.5 text-sm transition hover:brightness-95 {mark.late
				? 'text-now-text'
				: mark.kind === 'done'
					? 'text-ink-2'
					: 'text-ink'} {mark.kind === 'step' || mark.kind === 'release' ? 'font-medium' : ''}"
			style="background:{soft(mark.color, mark.kind === 'done' ? 10 : 18)}"
		>
			{#if mark.kind === 'done' && mark.person}<Avatar
					name={mark.person.name}
					color={mark.person.colorIndex}
					size="xs"
				/>{/if}
			<Icon size={13} class="shrink-0 {mark.kind === 'done' ? 'text-ok' : ''}" aria-hidden="true" />
			<span class="truncate {mark.kind === 'done' ? 'line-through decoration-ink-3/50' : ''}"
				>{mark.title}</span
			>
		</button>
	{/each}
	{#if marks.length > 3 && !all}
		<button type="button" onclick={() => (all = true)} class="h-7 text-sm text-ink-3 hover:text-ink"
			>+{marks.length - 3}</button
		>
	{/if}
</div>
