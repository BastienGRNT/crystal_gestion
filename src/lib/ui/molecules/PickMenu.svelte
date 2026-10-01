<script lang="ts" generics="V">
	import type { Snippet } from 'svelte';
	import MenuOption from './MenuOption.svelte';
	import Popover from './Popover.svelte';
	import type { PickOption } from '../types';

	interface Props {
		title: string;
		options: PickOption<V>[];
		/** Several choices (assignees): the menu stays open after a pick. */
		multiple?: boolean;
		onpick: (value: V) => void;
		trigger: Snippet<[() => void]>;
		align?: 'start' | 'end';
	}

	let { title, options, multiple = false, onpick, trigger, align = 'start' }: Props = $props();
	let open = $state(false);
	let query = $state('');
	let cursor = $state(0);
	// Long lists (features, people) get a filter field: type a few letters, Enter.
	const searchable = $derived(options.length > 6);
	const shown = $derived(
		options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
	);

	function toggle() {
		open = !open;
		query = '';
		cursor = Math.max(
			0,
			options.findIndex((o) => o.active)
		);
	}

	function pick(value: V) {
		onpick(value);
		if (!multiple) open = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const step = event.key === 'ArrowDown' ? 1 : -1;
			cursor = (cursor + step + shown.length) % Math.max(shown.length, 1);
		} else if (event.key === 'Enter' && shown[cursor]) {
			event.preventDefault();
			event.stopPropagation();
			pick(shown[cursor].value);
		}
	}
</script>

<svelte:window onkeydowncapture={onkeydown} />

<Popover {open} {align} onclose={() => (open = false)} width="w-64">
	{#snippet trigger()}{@render triggerWith(toggle)}{/snippet}
	{#if searchable}
		<!-- svelte-ignore a11y_autofocus -->
		<input
			bind:value={query}
			oninput={() => (cursor = 0)}
			autofocus
			placeholder="{title}…"
			class="mb-1 h-8 w-full rounded-[7px] bg-sunken px-2.5 text-ui outline-none placeholder:text-ink-3"
		/>
	{:else}
		<p class="px-2.5 pt-1.5 pb-1 text-2xs font-semibold text-ink-3">{title}</p>
	{/if}
	<div class="max-h-72 overflow-y-auto">
		{#each shown as option, i (i)}
			<MenuOption
				{option}
				highlighted={i === cursor}
				onpick={() => pick(option.value)}
				onhover={() => (cursor = i)}
			/>
		{:else}
			<p class="px-2.5 py-2 text-ui text-ink-3">Aucun résultat</p>
		{/each}
	</div>
</Popover>

{#snippet triggerWith(toggle: () => void)}{@render trigger(toggle)}{/snippet}
