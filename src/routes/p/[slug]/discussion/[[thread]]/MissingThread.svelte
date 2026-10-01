<script lang="ts">
	import { MessageSquareOff } from '@lucide/svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';

	let { href }: { href: string } = $props();
</script>

<div class="p-6">
	<EmptyState
		icon={MessageSquareOff}
		title="Ce fil n’existe plus"
		text="La Feat ou le canal a peut-être été supprimé."
	>
		<a {href}><Button size="sm">Aller dans Général</Button></a>
	</EmptyState>
</div>
