<script lang="ts">
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { activeProjects, lastProject } from '$lib/client/views/workspace';

	const { app } = useApp();

	// Opening Crystal lands in the project you were in, or in the first one.
	$effect(() => {
		const projects = activeProjects(app.projects.all);
		const last = projects.find((p) => p.slug === lastProject()) ?? projects[0];
		void goto(last ? `/p/${last.slug}` : '/projets', { replaceState: true });
	});
</script>
