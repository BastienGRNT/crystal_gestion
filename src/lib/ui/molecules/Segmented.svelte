<script lang="ts" generics="T extends string">
	interface Props {
		value: T;
		options: { value: T; label: string; tone?: string }[];
		onchange: (value: T) => void;
		label: string;
	}

	let { value, options, onchange, label }: Props = $props();
</script>

<div
	class="inline-flex shrink-0 gap-0.5 rounded-md bg-sunken p-0.5"
	role="radiogroup"
	aria-label={label}
>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={option.value === value}
			onclick={() => onchange(option.value)}
			class="h-7 rounded-[5px] px-2.5 text-sm transition {option.value === value
				? `bg-surface font-medium shadow-sm ${option.tone ?? 'text-ink'}`
				: 'text-ink-3 hover:text-ink-2'}"
		>
			{option.label}
		</button>
	{/each}
</div>
