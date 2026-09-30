<script lang="ts">
	import { MessagesSquare } from '@lucide/svelte';
	import Spinner from '$lib/ui/atoms/Spinner.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';

	let { loading, general }: { loading: boolean; general: boolean } = $props();
</script>

<div class="flex h-full flex-col justify-end px-4 pb-4 sm:px-6">
	{#if loading}
		<div class="flex justify-center py-10 text-ink-3"><Spinner size={18} /></div>
	{:else}
		<EmptyState
			icon={MessagesSquare}
			title="Lance la discussion"
			text={general
				? 'Une avancée, un doute, une question pour l’équipe ? Mentionne quelqu’un avec @ et lie un élément avec #.'
				: 'Tout ce qui concerne cette feature se discute ici. Un message peut ensuite devenir une tâche, une décision ou un fix.'}
		/>
	{/if}
</div>
