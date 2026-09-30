<script lang="ts">
	import { CornerDownRight, X } from '@lucide/svelte';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		author: string;
		excerpt: string;
		oncancel: () => void;
	}

	let { author, excerpt, oncancel }: Props = $props();
</script>

<div
	class="flex animate-rise items-center gap-1.5 border-b border-line py-1 pr-1 pl-3.5 text-sm text-ink-3"
>
	<CornerDownRight size={12} class="shrink-0 text-accent" />
	<span class="shrink-0">Réponse à <span class="font-medium text-ink-2">{author}</span></span>
	<span class="truncate">· {excerpt}</span>
	<IconButton label="Annuler la réponse" size="sm" class="ml-auto" onclick={oncancel}
		><X size={13} /></IconButton
	>
</div>
