<script lang="ts">
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';

	const { app, overlays } = useApp();

	const isTyping = (target: EventTarget | null) =>
		target instanceof HTMLElement &&
		(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

	const currentProjectId = () => app.projects.all.find((p) => p.slug === page.params.slug)?.id;
	const busy = () =>
		overlays.palette || overlays.create !== null || document.querySelector('dialog[open]');

	function onkeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			overlays.palette = !overlays.palette;
			return;
		}
		if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target) || busy()) return;
		const key = event.key.toLowerCase();
		if (key === 'n' || key === 'i') {
			event.preventDefault();
			overlays.newTask({ projectId: currentProjectId(), status: key === 'i' ? 'idea' : undefined });
		}
	}
</script>

<svelte:window {onkeydown} />
