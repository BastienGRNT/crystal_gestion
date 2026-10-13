<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Icon } from '../types';

	interface Props extends HTMLButtonAttributes {
		icon: Icon;
		/** Read by screen readers and shown on hover. */
		label: string;
		size?: 'sm' | 'md';
		active?: boolean;
		tone?: 'default' | 'danger';
	}

	let {
		icon: IconComponent,
		label,
		size = 'md',
		active = false,
		tone = 'default',
		class: extra = '',
		type = 'button',
		...rest
	}: Props = $props();
</script>

<button
	{type}
	aria-label={label}
	title={label}
	class={[
		'inline-flex shrink-0 items-center justify-center rounded-xl transition-colors disabled:opacity-40',
		size === 'sm' ? 'size-8' : 'size-10',
		active ? 'bg-active text-ink' : 'text-ink-3 hover:bg-hover hover:text-ink',
		tone === 'danger' && 'hover:bg-danger-soft hover:text-danger-text',
		extra
	]}
	{...rest}
>
	<IconComponent size={size === 'sm' ? 16 : 18} strokeWidth={2} aria-hidden="true" />
</button>
