<script lang="ts">
	import { Users } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import FilterMenu from '$lib/ui/molecules/FilterMenu.svelte';
	import { teamOrder } from '../team/usePresence.svelte';
	import { personFilter } from './filter.svelte';

	let { projectId }: { projectId: string } = $props();
	const { app } = useApp();
	const people = $derived(teamOrder(app, projectId));
	const chosen = $derived(people.find((p) => p.id === personFilter.value));

	// A filter on someone who left the team would hide everything.
	$effect(() => {
		if (personFilter.value && !people.some((p) => p.id === personFilter.value))
			personFilter.set(null);
	});
</script>

{#if people.length > 1}
	<FilterMenu
		label="Tâches de"
		text={chosen ? (chosen.id === app.meId ? 'Moi' : firstName(chosen.name)) : 'Tout le monde'}
		icon={Users}
		active={!!chosen}
		items={[
			{ label: 'Tout le monde', checked: !chosen, run: () => personFilter.set(null) },
			'separator',
			...people.map((p) => ({
				label: p.id === app.meId ? 'Moi' : firstName(p.name),
				checked: personFilter.value === p.id,
				run: () => personFilter.set(p.id)
			}))
		]}
	>
		{#snippet lead()}{#if chosen}<Avatar
					name={chosen.name}
					color={chosen.color}
					size="xs"
				/>{:else}<Users size={15} class="shrink-0" aria-hidden="true" />{/if}{/snippet}
	</FilterMenu>
{/if}
