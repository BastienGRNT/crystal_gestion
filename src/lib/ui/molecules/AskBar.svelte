<script lang="ts">
	import { Check, CircleHelp, Reply } from '@lucide/svelte';
	import Button from '../atoms/Button.svelte';

	interface Props {
		author: string;
		onreply: () => void;
		onresolve: () => void;
	}

	let { author, onreply, onresolve }: Props = $props();
</script>

<div
	class="mt-2 flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-should/30 bg-should/8 py-1 pr-1 pl-2.5"
>
	<CircleHelp size={14} class="shrink-0 text-should max-sm:hidden" />
	<span class="mr-1 text-[12.5px] whitespace-nowrap text-ink-2">
		<span class="font-medium text-ink">{author}</span> attend ta réponse
	</span>
	<Button size="sm" variant="primary" onclick={onreply}><Reply size={13} /> Répondre</Button>
	<Button size="sm" variant="ghost" onclick={onresolve}
		><Check size={13} /><span class="sm:hidden">Traité</span><span class="hidden sm:inline"
			>Marquer comme traité</span
		></Button
	>
</div>
