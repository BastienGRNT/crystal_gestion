<script lang="ts" generics="V">
	import { Check } from '@lucide/svelte';
	import Avatar from '../atoms/Avatar.svelte';
	import Dot from '../atoms/Dot.svelte';
	import StatusIcon from '../atoms/StatusIcon.svelte';
	import type { PickOption } from '../types';

	interface Props {
		option: PickOption<V>;
		highlighted: boolean;
		onpick: () => void;
		onhover: () => void;
	}

	let { option, highlighted, onpick, onhover }: Props = $props();
</script>

<button
	type="button"
	onclick={onpick}
	onmousemove={onhover}
	class="flex h-8 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-ui transition {highlighted
		? 'bg-hover'
		: ''}"
>
	{#if option.person}<Avatar name={option.person.name} color={option.person.color} size={20} />
	{:else if option.status}<StatusIcon status={option.status} size={15} />
	{:else if option.square}<span
			class="size-2.5 shrink-0 rounded-[3px]"
			style="background:{option.square}"
		></span>
	{:else if option.dot}<Dot color={option.dot} size={8} />
	{:else if option.icon}<option.icon size={14} class="text-ink-3" />{/if}
	<span class="min-w-0 flex-1 truncate">{option.label}</span>
	{#if option.hint}<span class="text-2xs text-ink-3">{option.hint}</span>{/if}
	<Check size={14} class="text-accent {option.active ? '' : 'opacity-0'}" />
</button>
