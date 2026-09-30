<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		label: string;
		active?: boolean;
		size?: 'sm' | 'md';
		children: Snippet;
	}

	let { label, active = false, size = 'md', children, class: extra, ...rest }: Props = $props();
</script>

<button
	type="button"
	aria-label={label}
	title={label}
	class="inline-flex shrink-0 items-center justify-center rounded-md text-ink-3 transition hover:bg-sunken hover:text-ink {active
		? 'bg-sunken text-ink'
		: ''} {size === 'sm' ? 'size-6' : 'size-8'} {extra}"
	{...rest}
>
	{@render children()}
</button>
