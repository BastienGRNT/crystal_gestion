<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Spinner from './Spinner.svelte';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		loading = false,
		children,
		class: extra,
		...rest
	}: Props = $props();

	const variants = {
		primary: 'bg-accent text-accent-ink hover:brightness-110 shadow-sm',
		secondary:
			'bg-surface text-ink border border-line shadow-card hover:border-line-strong hover:bg-surface-2',
		ghost: 'text-ink-2 hover:bg-sunken hover:text-ink',
		danger: 'text-danger border border-line hover:border-danger/50 hover:bg-danger/10'
	};
	const sizes = {
		sm: 'h-8 px-3 text-sm gap-1.5',
		md: 'h-9 px-3.5 text-base gap-2',
		lg: 'h-11 px-5 text-lg gap-2'
	};
</script>

<button
	type="button"
	class="inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 {variants[
		variant
	]} {sizes[size]} {extra}"
	disabled={loading || rest.disabled}
	{...rest}
>
	{#if loading}<Spinner size={14} />{/if}
	{@render children()}
</button>
