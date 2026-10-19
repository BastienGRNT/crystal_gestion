<script lang="ts">
	import { CalendarClock, Check, Flag, Rocket } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import AgendaPopover from './AgendaPopover.svelte';
	import type { DayMark, Point } from './types';

	const soft = (color: string, percent: number) =>
		`color-mix(in oklch, ${color} ${percent}%, transparent)`;
	const ICONS = { due: CalendarClock, step: Flag, release: Rocket, done: Check };
	const WORDS = { due: 'Échéance', step: 'Étape', release: 'Mise en prod', done: 'Fini' };
	/** Below this width a mark only shows a few letters: better one counter that opens them all. */
	const NARROW_PX = 150;

	interface Props {
		marks: DayMark[];
		/** "mar. 14", heading of the list. */
		day: string;
		onmark?: (mark: DayMark) => void;
	}

	let { marks, day, onmark }: Props = $props();
	let width = $state(Infinity);
	let all = $state(false);
	let opened = $state<Point | null>(null);
	const grouped = $derived(width < NARROW_PX && marks.length > 1);
	const shown = $derived(all ? marks : marks.slice(0, 3));
	const late = $derived(marks.some((m) => m.late));
	const important = $derived(marks.some((m) => m.kind === 'step' || m.kind === 'release'));
	const pick = (mark: DayMark) => ((opened = null), onmark?.(mark));
</script>

{#snippet chip(mark: DayMark, wide: boolean)}
	{@const Icon = ICONS[mark.kind]}
	<button
		type="button"
		onclick={() => pick(mark)}
		title="{WORDS[mark.kind]} : {mark.title}{mark.person ? ` (${mark.person.name})` : ''}"
		class="flex w-full min-w-0 items-center gap-1.5 rounded-md text-sm transition hover:brightness-95 {wide
			? 'h-9 px-2.5'
			: 'h-7 px-1.5'} {mark.late
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
		<span
			class="{wide ? '' : 'truncate'} {mark.kind === 'done'
				? 'line-through decoration-ink-3/50'
				: ''}">{mark.title}</span
		>
	</button>
{/snippet}

<!-- Above the hours: what is due, the end of a step, a release, and what got finished (by whom). -->
<div class="mt-1.5 flex min-h-7 flex-col gap-0.5 text-left" bind:clientWidth={width}>
	{#if grouped}
		<button
			type="button"
			onclick={(event) => (opened = { x: event.clientX, y: event.clientY })}
			class="flex h-7 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1.5 text-sm font-medium hover:bg-hover {late
				? 'bg-now-soft text-now-text'
				: 'bg-sunken text-ink-2'}"
			aria-haspopup="dialog"
		>
			{#if important}<Flag size={13} class="shrink-0" aria-hidden="true" />{/if}
			<span class="truncate">{marks.length} repères</span>
		</button>
	{:else}
		{#each shown as mark (mark.id)}{@render chip(mark, false)}{/each}
		{#if marks.length > 3 && !all}
			<button
				type="button"
				onclick={() => (all = true)}
				class="h-7 text-sm text-ink-3 hover:text-ink">+{marks.length - 3}</button
			>
		{/if}
	{/if}
</div>

{#if opened}
	<AgendaPopover point={opened} heading={day} detail="" onclose={() => (opened = null)} width={280}>
		<div class="flex flex-col gap-1 p-1">
			{#each marks as mark (mark.id)}{@render chip(mark, true)}{/each}
		</div>
	</AgendaPopover>
{/if}
