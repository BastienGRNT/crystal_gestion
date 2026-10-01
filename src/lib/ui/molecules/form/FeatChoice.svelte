<script lang="ts">
	interface Props {
		feats: { id: string; title: string; color: string }[];
		value: string | null;
		onchange: (id: string | null) => void;
	}

	/** Every feat as a radio row, and « aucune » for work on its own. */
	let { feats, value, onchange }: Props = $props();
	const rows = $derived([...feats, { id: null, title: 'Aucune, c’est à part', color: '' }] as {
		id: string | null;
		title: string;
		color: string;
	}[]);
</script>

<div
	role="radiogroup"
	aria-label="Feat"
	class="max-h-56 overflow-y-auto rounded-[13px] border-[1.5px] border-line-strong"
>
	{#each rows as row (row.id ?? 'none')}
		{@const on = row.id === value}
		<button
			type="button"
			role="radio"
			aria-checked={on}
			onclick={() => onchange(row.id)}
			class="flex h-12 w-full items-center gap-3 border-b-[1.5px] border-line px-4 text-left text-[15px] font-semibold transition last:border-b-0 {on
				? 'bg-accent-soft shadow-[inset_3px_0_0_var(--accent)]'
				: 'hover:bg-hover'} {row.id ? '' : 'text-ink-2'}"
		>
			{#if row.id}<span class="size-3 shrink-0 rounded-[4px]" style="background:{row.color}"></span>
			{:else}<span class="size-3 shrink-0 rounded-[4px] border-2 border-dashed border-line-strong"
				></span>{/if}
			<span class="min-w-0 flex-1 truncate">{row.title}</span>
			<span
				class="size-5 shrink-0 rounded-full border-2 {on
					? 'border-[6px] border-accent'
					: 'border-line-strong'}"
			></span>
		</button>
	{/each}
</div>
