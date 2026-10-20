<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import type { Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const initiatives = $derived(
		app.initiatives.all
			.filter((i) => i.projectId === project.id)
			.sort((a, b) => a.position - b.position)
	);
	const metrics = $derived(
		app.metrics.all.filter((m) => m.projectId === project.id && !m.archivedAt)
	);
	const metricOptions = $derived([
		{ value: '', label: 'Mesurée par… (aucun chiffre)' },
		...metrics.map((m) => ({ value: m.id, label: `Mesurée par : ${m.name}` }))
	]);
</script>

<div class="flex flex-col gap-2">
	{#each initiatives as initiative (initiative.id)}
		<div class="flex flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
			<div class="flex items-start gap-2">
				<EditableText
					label="Initiative"
					value={initiative.title}
					maxlength={120}
					class="flex-1 font-semibold"
					onsave={(title) => actions.framing.updateInitiative(initiative.id, { title })}
				/>
				<IconButton
					icon={Trash2}
					size="sm"
					label="Supprimer l’initiative"
					onclick={() => actions.framing.removeInitiative(initiative)}
				/>
			</div>
			<EditableText
				label="Pourquoi"
				value={initiative.why}
				placeholder="Pourquoi c’est un objectif (le résultat attendu)"
				allowEmpty
				maxlength={1000}
				class="text-sm text-ink-2"
				onsave={(why) => actions.framing.updateInitiative(initiative.id, { why })}
			/>
			{#if metrics.length}
				<Select
					size="sm"
					label="Chiffre qui la mesure"
					value={initiative.metricId ?? ''}
					options={metricOptions}
					class="self-start"
					onchange={(metricId) =>
						actions.framing.updateInitiative(initiative.id, { metricId: metricId || null })}
				/>
			{/if}
		</div>
	{/each}
	<InlineAdd
		label="Ajouter une initiative"
		placeholder="Un grand objectif, ex. : Remplacer le téléphone"
		onadd={(title) => actions.framing.addInitiative(project.id, title) !== null}
	/>
</div>
