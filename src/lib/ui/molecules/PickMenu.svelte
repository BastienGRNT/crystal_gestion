<script lang="ts" generics="V">
	import type { Snippet } from 'svelte';
	import { Check } from '@lucide/svelte';
	import Avatar from '../atoms/Avatar.svelte';
	import Dot from '../atoms/Dot.svelte';
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

	function pick(value: V) {
		onpick(value);
		if (!multiple) open = false;
	}
</script>

<Popover {open} {align} onclose={() => (open = false)} width="w-60">
	{#snippet trigger()}{@render triggerWith(() => (open = !open))}{/snippet}
	<p class="px-2.5 pt-1.5 pb-1 text-2xs font-semibold text-ink-3">{title}</p>
	{#each options as option, i (i)}
		<button
			type="button"
			onclick={() => pick(option.value)}
			class="flex h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-ui transition hover:bg-hover"
		>
			{#if option.person}<Avatar name={option.person.name} color={option.person.color} size={20} />
			{:else if option.dot}<Dot color={option.dot} size={8} />
			{:else if option.icon}<option.icon size={14} class="text-ink-3" />{/if}
			<span class="min-w-0 flex-1 truncate">{option.label}</span>
			{#if option.hint}<span class="text-2xs text-ink-3">{option.hint}</span>{/if}
			<Check size={14} class="text-accent {option.active ? '' : 'opacity-0'}" />
		</button>
	{/each}
</Popover>

{#snippet triggerWith(toggle: () => void)}{@render trigger(toggle)}{/snippet}
