<script lang="ts" generics="T extends string">
	interface Option {
		value: T | '';
		label: string;
	}

	interface Props {
		/** Read by screen readers. */
		label: string;
		value: T | '';
		options: Option[];
		onchange: (value: T | '') => void;
		size?: 'sm' | 'md';
		class?: string;
	}

	let { label, value, options, onchange, size = 'md', class: extra = '' }: Props = $props();
</script>

<select
	aria-label={label}
	{value}
	onchange={(e) => onchange(e.currentTarget.value as T | '')}
	class={[
		'max-w-full min-w-0 cursor-pointer rounded-xl border border-line-strong/70 bg-surface pr-8 pl-3 text-base text-ink outline-none hover:border-line-strong focus:border-accent focus:ring-4 focus:ring-accent-soft',
		size === 'sm' ? 'h-9 text-sm' : 'h-10',
		extra
	]}
>
	{#each options as option (option.value)}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>
