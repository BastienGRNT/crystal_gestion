<script lang="ts">
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import Conversation from '$lib/connected/chat/Conversation.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
	const channel = $derived(app.channels.get(page.params.channel));
</script>

{#if channel && project && channel.projectId === project.id}
	{#key channel.id}<Conversation {channel} {project} />{/key}
{:else}
	<div class="flex flex-1 items-center justify-center p-8">
		<EmptyState
			title="Ce canal n’existe plus"
			text="Il a sans doute été supprimé. Les autres canaux sont dans la liste."
		>
			<Button href="/p/{project?.slug}/discussion">Voir les canaux</Button>
		</EmptyState>
	</div>
{/if}
