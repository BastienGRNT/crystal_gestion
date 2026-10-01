<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { CreateKind } from '$lib/client/create-kinds';
	import { dueChoices } from '$lib/client/views/due-choices';
	import { MOSCOW, MOSCOW_LABELS } from '$lib/modules/features/domain/feature';
	import DotPills from '$lib/ui/molecules/DotPills.svelte';
	import PersonPills from '$lib/ui/molecules/PersonPills.svelte';
	import { PRIORITY_COLORS } from '$lib/ui/tones';
	import type { CreateDraft } from './create-draft';

	let { kind, draft = $bindable() }: { kind: CreateKind; draft: CreateDraft } = $props();
	const { store, me } = useProject();
	const features = $derived([
		...store.features.items
			.filter((f) => f.priority !== 'wont')
			.map((f) => ({
				value: f.id as string | null,
				label: f.title,
				dot: PRIORITY_COLORS[f.priority]
			})),
		{ value: null, label: 'Aucune' }
	]);
	const toggle = (ids: string[], id: string) =>
		ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
	const input =
		'h-8 rounded-lg border border-line bg-surface px-2.5 text-sm outline-none focus:border-accent';
</script>

<div class="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-2.5 px-[18px] pt-1.5 pb-4 text-xs">
	{#if kind === 'feature'}
		<span class="text-ink-3">Priorité</span>
		<DotPills
			options={MOSCOW.map((p) => ({ value: p, label: MOSCOW_LABELS[p], dot: PRIORITY_COLORS[p] }))}
			value={draft.priority}
			onchange={(priority) => (draft.priority = priority)}
		/>
		<span class="text-ink-3">Responsable</span>
		<PersonPills
			people={store.members.items}
			selected={[draft.ownerId]}
			meId={me.id}
			ontoggle={(id) => (draft.ownerId = id)}
		/>
	{:else}
		<span class="text-ink-3">Feature</span>
		<DotPills
			options={features}
			value={draft.featureId}
			onchange={(id) => (draft.featureId = id)}
		/>
	{/if}
	{#if kind === 'task' || kind === 'bug'}
		<span class="text-ink-3">Pour</span>
		<PersonPills
			people={store.members.items}
			selected={draft.assigneeIds}
			meId={me.id}
			ontoggle={(id) => (draft.assigneeIds = toggle(draft.assigneeIds, id))}
		/>
		<span class="text-ink-3">Échéance</span>
		<DotPills
			options={dueChoices(new Date())}
			value={draft.dueDate}
			onchange={(d) => (draft.dueDate = d)}
		/>
	{:else if kind === 'decision'}
		<span class="self-start pt-2 text-ink-3">Pourquoi</span>
		<textarea
			bind:value={draft.rationale}
			rows="2"
			placeholder="La raison en une ou deux phrases"
			class="resize-none rounded-lg border border-line bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
		></textarea>
	{:else if kind === 'fix'}
		<span class="text-ink-3">Problème</span>
		<input bind:value={draft.problem} placeholder="Ce qu’on voyait" class={input} />
		<span class="text-ink-3">Cause</span>
		<input bind:value={draft.cause} placeholder="Pourquoi ça arrivait" class={input} />
		<span class="text-ink-3">Solution</span>
		<input bind:value={draft.solution} placeholder="Ce qu’on a changé" class={input} />
	{/if}
</div>
