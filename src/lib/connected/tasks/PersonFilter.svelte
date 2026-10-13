<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import { teamOrder } from '../team/usePresence.svelte';
	import { personFilter } from './filter.svelte';

	let { projectId }: { projectId: string } = $props();
	const { app } = useApp();
	const people = $derived(teamOrder(app, projectId));

	// A filter on someone who left the team would hide everything.
	$effect(() => {
		if (personFilter.value && !people.some((p) => p.id === personFilter.value))
			personFilter.set(null);
	});
</script>

{#if people.length > 1}
	<div
		class="inline-flex gap-0.5 rounded-xl bg-sunken p-1"
		role="radiogroup"
		aria-label="Tâches de"
	>
		<button
			type="button"
			role="radio"
			aria-checked={personFilter.value === null}
			onclick={() => personFilter.set(null)}
			class={[
				'h-10 rounded-lg px-3.5 text-base font-medium transition-all',
				personFilter.value === null
					? 'bg-surface text-ink shadow-raise'
					: 'text-ink-3 hover:text-ink'
			]}>Tout le monde</button
		>
		{#each people as person (person.id)}
			<button
				type="button"
				role="radio"
				aria-checked={personFilter.value === person.id}
				onclick={() => personFilter.set(person.id)}
				class={[
					'inline-flex h-10 items-center gap-2 rounded-lg pr-3.5 pl-2 text-base font-medium transition-all',
					personFilter.value === person.id
						? 'bg-surface text-ink shadow-raise'
						: 'text-ink-3 hover:text-ink'
				]}
			>
				<Avatar name={person.name} color={person.color} size="sm" />
				{person.id === app.meId ? 'Moi' : firstName(person.name)}
			</button>
		{/each}
	</div>
{/if}
