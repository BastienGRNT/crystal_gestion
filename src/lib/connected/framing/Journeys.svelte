<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import type { Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import ProseField from '$lib/ui/molecules/ProseField.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const journeys = $derived(
		app.journeys.all
			.filter((j) => j.projectId === project.id)
			.sort((a, b) => a.position - b.position)
	);
</script>

<div class="flex flex-col gap-3">
	{#each journeys as journey (journey.id)}
		<div
			class="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
		>
			<div class="flex items-start gap-2">
				<EditableText
					label="Parcours"
					value={journey.title}
					maxlength={120}
					class="flex-1 font-semibold"
					onsave={(title) => actions.framing.updateJourney(journey.id, { title })}
				/>
				<IconButton
					icon={Trash2}
					size="sm"
					label="Supprimer le parcours"
					onclick={() => actions.framing.removeJourney(journey)}
				/>
			</div>
			<ProseField
				label="Étapes et règles du parcours"
				value={journey.body}
				maxlength={20_000}
				placeholder="Les écrans dans l’ordre (liste numérotée), puis les règles : que se passe-t-il si le paiement échoue ? Cite les stories : US-7."
				onsave={(body) => actions.framing.updateJourney(journey.id, { body })}
			/>
		</div>
	{/each}
	<InlineAdd
		label="Ajouter un parcours"
		placeholder="Ex. : Un patient réserve son premier rendez-vous"
		onadd={(title) => actions.framing.addJourney(project.id, title) !== null}
	/>
</div>
