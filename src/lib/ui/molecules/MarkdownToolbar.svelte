<script lang="ts">
	import { Bold, Heading1, Heading2, Link, List, ListOrdered, TextQuote } from '@lucide/svelte';
	import type { LineFormat } from '$lib/client/markdown-edit';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		/** The format of the line holding the cursor, shown pressed. */
		current: LineFormat | null;
		onformat: (format: LineFormat) => void;
		onbold: () => void;
		onlink: () => void;
	}

	let { current, onformat, onbold, onlink }: Props = $props();

	const LINES = [
		{ format: 'h1', icon: Heading1, label: 'Titre' },
		{ format: 'h2', icon: Heading2, label: 'Sous-titre' },
		{ format: 'bullet', icon: List, label: 'Liste à puces' },
		{ format: 'number', icon: ListOrdered, label: 'Liste numérotée' },
		{ format: 'quote', icon: TextQuote, label: 'Citation' }
	] as const;
</script>

<!-- Pressing a button keeps the focus in the text: the selection stays where it was. -->
<div
	role="toolbar"
	aria-label="Mise en forme"
	tabindex="-1"
	class="flex flex-wrap items-center gap-0.5"
	onmousedown={(e) => e.preventDefault()}
>
	<IconButton icon={Bold} label="Gras (Ctrl+B)" onclick={onbold} />
	<span class="mx-1 h-5 w-px bg-line" aria-hidden="true"></span>
	{#each LINES as line (line.format)}
		<IconButton
			icon={line.icon}
			label={line.label}
			active={current === line.format}
			aria-pressed={current === line.format}
			onclick={() => onformat(line.format)}
		/>
	{/each}
	<span class="mx-1 h-5 w-px bg-line" aria-hidden="true"></span>
	<IconButton icon={Link} label="Lien" onclick={onlink} />
</div>
