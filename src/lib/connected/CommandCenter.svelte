<script lang="ts">
	import { goto } from '$app/navigation';
	import { useProject } from '$lib/client/context';
	import { projectPath } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { paletteGroups, type PaletteIntents } from '$lib/client/palette';
	import { theme } from '$lib/client/theme.svelte';
	import CommandPalette from '$lib/ui/organisms/CommandPalette.svelte';

	const { store, refs } = useProject();
	const slug = $derived(store.project.slug);

	const intents: PaletteIntents = {
		create: (kind, title) => overlays.openCreate(kind, { title }),
		open: (element) => goto(refs.href(element)),
		navigate: (path) => goto(projectPath(slug, path)),
		toggleTheme: () => theme.cycle()
	};
	const groups = $derived(
		paletteGroups(overlays.paletteQuery.trim(), store.elements.items, intents)
	);
</script>

{#if overlays.palette}
	<CommandPalette
		bind:query={overlays.paletteQuery}
		{groups}
		onclose={() => (overlays.palette = false)}
	/>
{/if}
