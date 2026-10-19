<script lang="ts">
	interface Option {
		id: string;
		name: string;
		color: string;
	}

	interface Props {
		options: Option[];
		value: string | null;
		onchange: (id: string | null) => void;
	}

	let { options, value, onchange }: Props = $props();
</script>

<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Module">
	{#each [{ id: null, name: 'Aucun', color: '' }, ...options] as option (option.id ?? 'none')}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.id}
			onclick={() => onchange(option.id)}
			class={[
				'inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors',
				value === option.id
					? 'border-accent bg-accent-soft text-accent-text'
					: 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
			]}
		>
			{#if option.color}<span class="size-2.5 rounded-[3px]" style:background-color={option.color}
				></span>{/if}{option.name}
		</button>
	{/each}
</div>
