<script lang="ts">
	import { MessagesSquare } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { generalOf } from '$lib/client/views/workspace';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));

	// On a wide screen, opening Discussion lands in the general channel right away.
	$effect(() => {
		const general = project && generalOf(app.channels.all, project.id);
		if (general && project && matchMedia('(min-width: 1024px)').matches)
			void goto(`/p/${project.slug}/discussion/${general.id}`, { replaceState: true });
	});
</script>

<div class="flex flex-1 items-center justify-center p-8">
	<EmptyState
		icon={MessagesSquare}
		title="Choisis un canal"
		text="Le canal général pour tout, et un canal par sujet quand ça devient touffu."
	/>
</div>
