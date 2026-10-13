<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Icon } from '../types';

	interface Props {
		href: string;
		label: string;
		icon?: Icon;
		active?: boolean;
		badge?: number;
		/** `strong` for things waiting for you (mentions), `soft` for plain counts. */
		badgeTone?: 'strong' | 'soft';
		leading?: Snippet;
		onclick?: () => void;
	}

	let {
		href,
		label,
		icon: IconComponent,
		active = false,
		badge = 0,
		badgeTone = 'soft',
		leading,
		onclick
	}: Props = $props();
</script>

<a
	{href}
	{onclick}
	aria-current={active ? 'page' : undefined}
	class={[
		'group flex h-10 items-center gap-3 rounded-xl px-3 text-base transition-colors',
		active
			? 'bg-surface font-medium text-ink shadow-card'
			: 'text-ink-2 hover:bg-hover hover:text-ink'
	]}
>
	{#if leading}
		<span class="flex size-[18px] shrink-0 items-center justify-center">{@render leading()}</span>
	{:else if IconComponent}
		<IconComponent
			size={18}
			strokeWidth={1.9}
			aria-hidden="true"
			class={active ? 'text-ink' : 'text-ink-3 group-hover:text-ink-2'}
		/>
	{/if}
	<span class="min-w-0 flex-1 truncate">{label}</span>
	{#if badge > 0}
		<span
			class={[
				'min-w-5 rounded-full px-1.5 text-center text-xs leading-5 font-semibold tabular-nums',
				badgeTone === 'strong' ? 'bg-accent text-accent-ink' : 'bg-sunken text-ink-2'
			]}>{badge}</span
		>
	{/if}
</a>
