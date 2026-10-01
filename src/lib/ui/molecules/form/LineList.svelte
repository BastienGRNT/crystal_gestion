<script lang="ts">
	import { Plus, X } from '@lucide/svelte';

	interface Props {
		lines: string[];
		placeholder: string;
		onchange: (lines: string[]) => void;
	}

	/** Build a list by typing: Enter adds the line and keeps the cursor for the next one. */
	let { lines, placeholder, onchange }: Props = $props();
	let draft = $state('');

	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		event.stopPropagation();
		if (draft.trim()) onchange([...lines, draft.trim()]);
		draft = '';
	}
</script>

<div class="overflow-hidden rounded-[13px] border-[1.5px] border-line-strong">
	{#each lines as line, i (i)}
		<div class="group flex h-12 items-center gap-3 border-b-[1.5px] border-line px-4 text-[15px]">
			<span class="size-[19px] shrink-0 rounded-full border-2 border-line-strong"></span>
			<span class="min-w-0 flex-1 truncate">{line}</span>
			<button
				type="button"
				aria-label="Retirer"
				onclick={() => onchange(lines.filter((_, j) => j !== i))}
				class="text-ink-3 opacity-0 group-hover:opacity-100 hover:text-ink"><X size={16} /></button
			>
		</div>
	{/each}
	<label class="flex h-12 items-center gap-3 px-4 text-[15px] focus-within:bg-surface-2">
		<Plus size={18} class="shrink-0 text-ink-3" />
		<input
			bind:value={draft}
			onkeydown={keydown}
			onblur={() => draft.trim() && (onchange([...lines, draft.trim()]), (draft = ''))}
			{placeholder}
			class="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-3"
		/>
	</label>
</div>
