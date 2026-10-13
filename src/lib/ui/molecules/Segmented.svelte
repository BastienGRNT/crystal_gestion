<script lang="ts" generics="T extends string">
	import type { Icon } from '../types';

	interface Option {
		value: T;
		label: string;
		icon?: Icon;
		dot?: string;
	}

	interface Props {
		options: Option[];
		value: T;
		label: string;
		onchange: (value: T) => void;
		size?: 'sm' | 'md';
		stretch?: boolean;
	}

	let { options, value, label, onchange, size = 'md', stretch = false }: Props = $props();
</script>

<div
	role="radiogroup"
	aria-label={label}
	class={['inline-flex gap-0.5 rounded-xl bg-sunken p-1', stretch && 'flex w-full']}
>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={option.value === value}
			onclick={() => onchange(option.value)}
			class={[
				'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-all',
				size === 'sm' ? 'h-8 px-3 text-sm' : 'h-10 px-3.5 text-base',
				stretch && 'flex-1',
				option.value === value ? 'bg-surface text-ink shadow-raise' : 'text-ink-3 hover:text-ink'
			]}
		>
			{#if option.dot}<span class={['size-2 rounded-full', option.dot]}></span>{/if}
			{#if option.icon}<option.icon size={15} aria-hidden="true" />{/if}
			{option.label}
		</button>
	{/each}
</div>
