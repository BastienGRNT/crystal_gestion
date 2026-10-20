<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { TECH_LEVEL_LABELS } from '$lib/client/labels';
	import type { TechLevel } from '$lib/modules/framing/domain/framing';
	import type { Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const personas = $derived(
		app.stakeholders.all
			.filter((s) => s.projectId === project.id && s.role === 'uses')
			.sort((a, b) => a.position - b.position)
	);
	const others = $derived(
		app.stakeholders.all.filter(
			(s) => s.projectId === project.id && (s.role === 'decides' || s.role === 'validates')
		)
	);
	const levels = [
		{ value: '' as const, label: 'Niveau technique ?' },
		...Object.entries(TECH_LEVEL_LABELS).map(([value, label]) => ({
			value: value as TechLevel,
			label: `Niveau technique : ${label.toLowerCase()}`
		}))
	];
	const storiesOf = (id: string) => app.stories.all.filter((s) => s.personaId === id).length;
</script>

<div class="flex flex-col gap-3">
	<div class="grid gap-3 sm:grid-cols-2">
		{#each personas as persona (persona.id)}
			<div
				class="flex flex-col gap-1 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card"
			>
				<div class="flex items-start gap-2">
					<EditableText
						label="Persona"
						value={persona.name}
						maxlength={80}
						class="flex-1 font-semibold"
						onsave={(name) => actions.framing.updateStakeholder(persona.id, { name })}
					/>
					<span class="pt-2.5 text-xs text-ink-3"
						>{storiesOf(persona.id)} stor{storiesOf(persona.id) > 1 ? 'ies' : 'y'}</span
					>
					<IconButton
						icon={Trash2}
						size="sm"
						label="Retirer le persona"
						onclick={() => actions.framing.removeStakeholder(persona)}
					/>
				</div>
				<EditableText
					label="Besoins"
					value={persona.expects}
					placeholder="Ses besoins principaux"
					allowEmpty
					maxlength={1000}
					class="text-sm"
					onsave={(expects) => actions.framing.updateStakeholder(persona.id, { expects })}
				/>
				<EditableText
					label="Interactions clés"
					value={persona.interactions}
					placeholder="Ce qu’il fait dans l’application"
					allowEmpty
					maxlength={1000}
					class="text-sm text-ink-2"
					onsave={(interactions) => actions.framing.updateStakeholder(persona.id, { interactions })}
				/>
				<Select
					size="sm"
					label="Niveau technique"
					value={persona.techLevel ?? ''}
					options={levels}
					class="self-start"
					onchange={(techLevel) =>
						actions.framing.updateStakeholder(persona.id, { techLevel: techLevel || null })}
				/>
			</div>
		{/each}
	</div>
	<InlineAdd
		label="Ajouter un persona"
		placeholder="Un type d’utilisateur, ex. : Patient, Kiné, Secrétaire"
		onadd={(name) => actions.framing.addStakeholder(project.id, name, 'uses') !== null}
	/>
	{#if others.length}
		<p class="text-sm text-ink-3">
			Acteurs qui décident ou valident : {others.map((o) => o.name).join(', ')} (voir la note de cadrage).
		</p>
	{/if}
</div>
