<script lang="ts">
	import { ChevronDown, Trash2 } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { useApp } from '$lib/client/context';
	import { INFORM_LABELS, STAKEHOLDER_ROLE_LABELS } from '$lib/client/labels';
	import type { Level, Stakeholder } from '$lib/modules/framing/domain/framing';
	import type { Project } from '$lib/modules/projects/domain/project';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const people = $derived(
		app.stakeholders.all
			.filter((s) => s.projectId === project.id)
			.sort((a, b) => a.position - b.position)
	);
	const roles = Object.entries(STAKEHOLDER_ROLE_LABELS).map(([value, label]) => ({
		value: value as Stakeholder['role'],
		label
	}));
	const levels = [
		{ value: 'high' as Level, label: 'Forte' },
		{ value: 'low' as Level, label: 'Faible' }
	];
	const informs = [
		{ value: '' as const, label: 'Pas de rythme' },
		...Object.entries(INFORM_LABELS).map(([value, label]) => ({
			value: value as NonNullable<Stakeholder['informEvery']>,
			label
		}))
	];

	/** The classic influence × interest grid, in words everyone reads. */
	const QUADRANTS = [
		{ influence: 'high', interest: 'high', label: 'Gérer de près' },
		{ influence: 'high', interest: 'low', label: 'Satisfaire' },
		{ influence: 'low', interest: 'high', label: 'Tenir informé' },
		{ influence: 'low', interest: 'low', label: 'Surveiller' }
	] as const;
	const opened = new SvelteSet<string>();
	/** One line instead of four fields: "influence forte · intérêt fort · chaque semaine". */
	const summary = (p: Stakeholder) =>
		[
			`influence ${p.influence === 'high' ? 'forte' : 'faible'}`,
			`intérêt ${p.interest === 'high' ? 'fort' : 'faible'}`,
			p.informEvery ? INFORM_LABELS[p.informEvery].toLowerCase() : null
		]
			.filter(Boolean)
			.join(' · ');
	const update = (id: string, changes: Partial<Stakeholder>) =>
		actions.framing.updateStakeholder(id, changes);
</script>

<div class="flex flex-col gap-4">
	{#if people.length}
		<ul
			class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface shadow-card"
		>
			{#each people as person (person.id)}
				<li class="flex flex-col gap-2 px-4 py-3">
					<div class="flex items-start gap-2">
						<div class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
							<EditableText
								label="Nom ou rôle"
								value={person.name}
								maxlength={80}
								class="font-medium"
								onsave={(name) => update(person.id, { name })}
							/>
							<EditableText
								label="Organisation"
								value={person.organization}
								placeholder="Organisation"
								allowEmpty
								maxlength={80}
								class="text-sm text-ink-3"
								onsave={(organization) => update(person.id, { organization })}
							/>
						</div>
						<IconButton
							icon={Trash2}
							size="sm"
							label="Retirer {person.name}"
							onclick={() => actions.framing.removeStakeholder(person)}
						/>
					</div>
					<div class="flex flex-wrap items-center gap-2 text-sm">
						<Select
							size="sm"
							label="Rôle"
							value={person.role}
							options={roles}
							onchange={(role) => role && update(person.id, { role })}
						/>
						<button
							class="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-ink-3 hover:bg-hover hover:text-ink"
							aria-expanded={opened.has(person.id)}
							onclick={() =>
								opened.has(person.id) ? opened.delete(person.id) : opened.add(person.id)}
						>
							{summary(person)}
							<ChevronDown
								size={14}
								class={['transition-transform', opened.has(person.id) && 'rotate-180']}
							/>
						</button>
					</div>
					{#if opened.has(person.id)}
						<div class="flex flex-wrap items-center gap-2 text-sm">
							<span class="text-ink-3">Influence</span>
							<Select
								size="sm"
								label="Influence"
								value={person.influence}
								options={levels}
								onchange={(influence) => influence && update(person.id, { influence })}
							/>
							<span class="text-ink-3">Intérêt</span>
							<Select
								size="sm"
								label="Intérêt"
								value={person.interest}
								options={levels}
								onchange={(interest) => interest && update(person.id, { interest })}
							/>
							<Select
								size="sm"
								label="À quelle fréquence l’informer"
								value={person.informEvery ?? ''}
								options={informs}
								onchange={(v) => update(person.id, { informEvery: v || null })}
							/>
						</div>
					{/if}
					<EditableText
						label="Ce qu’il attend"
						value={person.expects}
						placeholder="Ce qu’il attend du projet"
						allowEmpty
						maxlength={1000}
						class="text-sm text-ink-2"
						onsave={(expects) => update(person.id, { expects })}
					/>
				</li>
			{/each}
		</ul>

		<div class="grid grid-cols-2 gap-2" aria-label="Influence et intérêt">
			{#each QUADRANTS as q (q.label)}
				{@const inside = people.filter(
					(p) => p.influence === q.influence && p.interest === q.interest
				)}
				<div class="flex min-h-20 flex-col gap-1 rounded-xl bg-surface-2 p-3">
					<span class="text-xs font-semibold tracking-wide text-ink-3 uppercase">{q.label}</span>
					<span class="text-sm text-ink-2">{inside.map((p) => p.name).join(', ') || '—'}</span>
				</div>
			{/each}
		</div>
	{/if}
	<InlineAdd
		label="Ajouter une partie prenante"
		placeholder="Ex. : Le cabinet client, puis Entrée"
		onadd={(name) => actions.framing.addStakeholder(project.id, name, 'decides')}
	/>
</div>
