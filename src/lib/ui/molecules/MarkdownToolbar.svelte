<script lang="ts">
	import {
		Bold,
		Heading1,
		Heading2,
		Italic,
		Link,
		List,
		ListOrdered,
		TextQuote
	} from '@lucide/svelte';
	import type { TextFormat } from '../types';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		/** The formats under the cursor, shown pressed. */
		active: Set<TextFormat>;
		onformat: (format: TextFormat) => void;
	}

	let { active, onformat }: Props = $props();

	const GROUPS = [
		[
			{ format: 'bold', icon: Bold, label: 'Gras (Ctrl+B)' },
			{ format: 'italic', icon: Italic, label: 'Italique (Ctrl+I)' }
		],
		[
			{ format: 'h1', icon: Heading1, label: 'Titre' },
			{ format: 'h2', icon: Heading2, label: 'Sous-titre' },
			{ format: 'bullet', icon: List, label: 'Liste à puces' },
			{ format: 'number', icon: ListOrdered, label: 'Liste numérotée' },
			{ format: 'quote', icon: TextQuote, label: 'Citation' }
		],
		[{ format: 'link', icon: Link, label: 'Lien (Ctrl+K)' }]
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
	{#each GROUPS as group, i (i)}
		{#if i}<span class="mx-1 h-5 w-px bg-line" aria-hidden="true"></span>{/if}
		{#each group as button (button.format)}
			<IconButton
				icon={button.icon}
				label={button.label}
				size="sm"
				active={active.has(button.format)}
				aria-pressed={active.has(button.format)}
				onclick={() => onformat(button.format)}
			/>
		{/each}
	{/each}
</div>
