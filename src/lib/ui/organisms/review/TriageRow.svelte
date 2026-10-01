<script lang="ts">
	import { Check, Gem, SquareCheckBig, Trash2 } from '@lucide/svelte';

	interface Props {
		title: string;
		ref: string;
		ontask: () => void;
		onfeature: () => void;
		onkeep: () => void;
		ondelete: () => void;
	}

	let { title, ref, ontask, onfeature, onkeep, ondelete }: Props = $props();
	const action =
		'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-sm text-ink-2 transition hover:bg-sunken hover:text-ink';
</script>

<div class="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line py-2.5 last:border-0">
	<span class="font-mono text-2xs text-ink-3">{ref}</span>
	<span class="min-w-40 flex-1 font-medium">{title}</span>
	<span class="flex gap-0.5">
		<button class={action} onclick={ontask}><SquareCheckBig size={13} /> Task</button>
		<button class={action} onclick={onfeature}><Gem size={13} /> Feat</button>
		<button class={action} onclick={onkeep}><Check size={13} /> Garder</button>
		<button class="{action} hover:text-danger" onclick={ondelete} aria-label="Supprimer {title}"
			><Trash2 size={13} /></button
		>
	</span>
</div>
