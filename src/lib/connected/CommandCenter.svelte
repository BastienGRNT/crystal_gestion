<script lang="ts">
	import { goto } from '$app/navigation';
	import { BookOpen, Lightbulb, Plus, SunMoon } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { NAVIGATION, projectPath } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { KIND_META } from '$lib/client/refs/kinds';
	import { searchElements } from '$lib/client/refs/search';
	import { theme } from '$lib/client/theme.svelte';
	import CommandPalette from '$lib/ui/organisms/CommandPalette.svelte';
	import type { PaletteGroup } from '$lib/ui/types';

	const { store, actions, refs, me, peek } = useProject();
	const slug = $derived(store.project.slug);
	const q = $derived(overlays.paletteQuery.trim());

	const createTask = async () => {
		const task = await actions.tasks.create({ title: q, assigneeIds: [me.id] });
		if (task) peek(task.ref);
	};
	const createDecision = () =>
		goto(`${projectPath(slug, '/journal')}?new=decision&title=${encodeURIComponent(q)}`);

	const groups: PaletteGroup[] = $derived([
		{
			label: 'Créer',
			items: q
				? [
						{
							id: 'new-task',
							label: `Nouvelle tâche « ${q} »`,
							icon: Plus,
							hint: 'C',
							run: createTask
						},
						{
							id: 'new-idea',
							label: `Nouvelle idée « ${q} »`,
							icon: Lightbulb,
							run: () => actions.ideas.create({ title: q })
						},
						{
							id: 'new-decision',
							label: `Tracer une décision « ${q} »`,
							icon: BookOpen,
							run: createDecision
						}
					]
				: []
		},
		{
			label: 'Éléments',
			items: searchElements(
				store.elements.items.filter((e) => !e.id.startsWith('draft-')),
				q,
				q ? 8 : 5
			).map((element) => ({
				id: element.id,
				label: element.title,
				hint: element.ref,
				icon: KIND_META[element.kind].icon,
				run: () => goto(refs.href(element))
			}))
		},
		{
			label: 'Aller à',
			items: NAVIGATION.filter((item) => item.label.toLowerCase().includes(q.toLowerCase())).map(
				(item) => ({
					id: item.key,
					label: item.label,
					icon: item.icon,
					hint: item.shortcut.toUpperCase(),
					run: () => goto(projectPath(slug, item.path))
				})
			)
		},
		{
			label: 'Actions',
			items: [
				{ id: 'theme', label: 'Changer de thème', icon: SunMoon, run: () => theme.cycle() }
			].filter((item) => item.label.toLowerCase().includes(q.toLowerCase()))
		}
	]);
</script>

{#if overlays.palette}
	<CommandPalette
		bind:query={overlays.paletteQuery}
		{groups}
		onclose={() => (overlays.palette = false)}
	/>
{/if}
