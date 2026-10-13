<script lang="ts">
	import { initials } from '$lib/client/format';
	import { tint } from '$lib/client/labels';

	interface Props {
		name: string;
		color: number;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		/** Tailwind background class of the presence dot, or nothing. */
		dot?: string | null;
		/** Color of the gap around the dot: the background the avatar sits on. */
		ring?: string;
		class?: string;
	}

	let {
		name,
		color,
		size = 'sm',
		dot = null,
		ring = 'ring-surface',
		class: extra = ''
	}: Props = $props();

	const sizes = {
		xs: 'size-5 text-[9px]',
		sm: 'size-6 text-[10px]',
		md: 'size-8 text-xs',
		lg: 'size-11 text-base'
	};
	const dots = { xs: 'size-2', sm: 'size-2.5', md: 'size-3', lg: 'size-3.5' };
</script>

<span class={['relative inline-flex shrink-0', extra]} title={name}>
	<span
		class={[
			'inline-flex items-center justify-center rounded-full font-semibold tracking-tight text-white',
			sizes[size]
		]}
		style:background-color={tint(color)}
		aria-hidden="true">{initials(name)}</span
	>
	<span class="sr-only">{name}</span>
	{#if dot}
		<span class={['absolute -right-0.5 -bottom-0.5 rounded-full ring-2', ring, dots[size], dot]}
		></span>
	{/if}
</span>
