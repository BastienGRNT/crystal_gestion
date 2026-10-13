<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Icon } from '../types';
	import Kbd from './Kbd.svelte';
	import Spinner from './Spinner.svelte';

	type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: 'sm' | 'md' | 'lg';
		icon?: Icon;
		/** Key that triggers it, shown next to the label. */
		shortcut?: string;
		href?: string;
		loading?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'md',
		icon: IconComponent,
		shortcut,
		href,
		loading = false,
		children,
		class: extra = '',
		type = 'button',
		disabled,
		...rest
	}: Props = $props();

	const sizes = {
		sm: 'h-9 gap-1.5 px-3 text-sm',
		md: 'h-10 gap-2 px-4 text-base',
		lg: 'h-12 gap-2 px-5 text-md'
	};
	const variants: Record<Variant, string> = {
		primary: 'bg-primary text-primary-ink hover:bg-primary-hover',
		accent: 'bg-accent text-accent-ink hover:bg-accent-hover',
		secondary:
			'border border-line bg-surface text-ink shadow-card hover:border-line-strong hover:bg-surface-2',
		ghost: 'text-ink-2 hover:bg-hover hover:text-ink',
		danger: 'text-danger-text hover:bg-danger-soft'
	};
	const classes = $derived([
		'inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50',
		sizes[size],
		variants[variant],
		extra
	]);
	const inverse = $derived(variant === 'primary' || variant === 'accent');
</script>

{#snippet content()}
	{#if loading}
		<Spinner size={size === 'sm' ? 14 : 16} />
	{:else if IconComponent}
		<IconComponent size={size === 'lg' ? 18 : 16} strokeWidth={2} aria-hidden="true" />
	{/if}
	{@render children?.()}
	{#if shortcut}
		<span class="ml-0.5 hidden sm:inline-flex"
			><Kbd keys={shortcut} tone={inverse ? 'inverse' : 'default'} /></span
		>
	{/if}
{/snippet}

{#if href}
	<a {href} class={classes}>{@render content()}</a>
{:else}
	<button {type} class={classes} disabled={disabled || loading} {...rest}
		>{@render content()}</button
	>
{/if}
