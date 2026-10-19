<script lang="ts" generics="K extends string">
	import type { TemplateOption } from '../types';

	interface Props {
		options: TemplateOption<K>[];
		value: K;
		onchange: (value: K) => void;
	}

	let { options, value, onchange }: Props = $props();
</script>

<div class="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Type de projet">
	{#each options as option (option.key)}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.key}
			onclick={() => onchange(option.key)}
			class={[
				'flex min-h-20 flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-colors',
				value === option.key
					? 'border-accent bg-accent-soft ring-2 ring-accent/20'
					: 'border-line bg-surface hover:border-line-strong'
			]}
		>
			<span class="text-base font-semibold">{option.name}</span>
			<span class="text-sm text-ink-2">{option.summary}</span>
			{#if option.steps.length}
				<span class="text-xs text-ink-3">{option.steps.join(' → ')}</span>
			{/if}
		</button>
	{/each}
</div>
