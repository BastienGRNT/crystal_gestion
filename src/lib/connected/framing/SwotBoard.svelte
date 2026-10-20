<script lang="ts">
	import { FlaskConical, Layers, Link2, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { STRATEGY_LABELS, SWOT_LABELS } from '$lib/client/labels';
	import {
		fitsStrategy,
		MAX_SWOT_PER_QUADRANT,
		type Strategy,
		type StrategyKind,
		type SwotQuadrant
	} from '$lib/modules/framing/domain/framing';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const items = $derived(
		app.swot.all.filter((i) => i.projectId === project.id).sort((a, b) => a.position - b.position)
	);
	const strategies = $derived(
		app.strategies.all
			.filter((s) => s.projectId === project.id)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
	);
	const of = (q: SwotQuadrant) => items.filter((i) => i.quadrant === q);
	const textOf = (id: string) => items.find((i) => i.id === id)?.text ?? '';
	const TONES: Record<SwotQuadrant, string> = {
		S: 'bg-ok-soft text-ok-text',
		W: 'bg-warn-soft text-warn-text',
		O: 'bg-plan-soft text-plan-text',
		T: 'bg-danger-soft text-danger-text'
	};

	function toggleItem(strategy: Strategy, id: string) {
		const itemIds = strategy.itemIds.includes(id)
			? strategy.itemIds.filter((i) => i !== id)
			: [...strategy.itemIds, id];
		actions.framing.updateStrategy(strategy.id, { itemIds });
	}
</script>

{#snippet family(q: SwotQuadrant)}
	<div class="flex flex-col gap-1.5">
		<span class={['self-start rounded-md px-2 py-0.5 text-xs font-semibold', TONES[q]]}
			>{SWOT_LABELS[q].label}</span
		>
		<ul class="flex flex-col">
			{#each of(q) as item (item.id)}
				<li class="group flex items-start gap-1">
					<EditableText
						label={SWOT_LABELS[q].label}
						value={item.text}
						maxlength={160}
						class="text-sm"
						onsave={(text) => actions.framing.updateSwotItem(item.id, text)}
					/>
					<IconButton
						icon={Trash2}
						size="sm"
						label="Retirer"
						class="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
						onclick={() => actions.framing.removeSwotItem(item)}
					/>
				</li>
			{/each}
		</ul>
		{#if of(q).length < MAX_SWOT_PER_QUADRANT}
			<InlineAdd
				label="Ajouter"
				placeholder={SWOT_LABELS[q].question}
				onadd={(text) => actions.framing.addSwotItem(project.id, q, text)}
			/>
		{/if}
	</div>
{/snippet}

{#snippet cell(kind: StrategyKind)}
	{@const eligible = items.filter((i) => fitsStrategy(kind, i.quadrant))}
	<div class="flex flex-col gap-2 rounded-xl border border-line bg-surface-2 p-3">
		<p class="text-xs">
			<span class="font-mono font-semibold text-ink-2">{kind}</span>
			<span class="font-semibold text-ink-2">· {STRATEGY_LABELS[kind].label}</span>
			<span class="text-ink-3"> · {STRATEGY_LABELS[kind].hint}</span>
		</p>
		{#each strategies.filter((s) => s.kind === kind) as strategy (strategy.id)}
			{@const epic = app.epics.get(strategy.epicId)}
			<div class="flex flex-col gap-1.5 rounded-lg border border-line bg-surface p-2">
				<div class="flex items-start gap-1">
					<EditableText
						label="Stratégie"
						value={strategy.text}
						maxlength={200}
						class="flex-1 text-sm font-medium"
						onsave={(text) => actions.framing.updateStrategy(strategy.id, { text })}
					/>
					<Menu
						label="Croiser avec…"
						items={eligible.map((i) => ({
							label: `${strategy.itemIds.includes(i.id) ? '✓ ' : ''}${i.text}`,
							run: () => toggleItem(strategy, i.id)
						}))}
					>
						{#snippet trigger({ props })}<IconButton
								icon={Link2}
								size="sm"
								label="Croiser avec…"
								{...props}
							/>{/snippet}
					</Menu>
					<IconButton
						icon={Trash2}
						size="sm"
						label="Retirer la stratégie"
						onclick={() => actions.framing.removeStrategy(strategy)}
					/>
				</div>
				{#if strategy.itemIds.length}
					<p class="flex flex-wrap gap-1">
						{#each strategy.itemIds as id (id)}
							<span class="rounded-md bg-sunken px-1.5 text-xs text-ink-2">{textOf(id)}</span>
						{/each}
					</p>
				{/if}
				<div class="flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
					{#if epic}
						<a
							href="/p/{project.slug}/cadrage/fonctionnel#stories"
							class="text-accent-text hover:underline">→ epic « {epic.title} »</a
						>
					{:else}
						<Button
							size="sm"
							icon={Layers}
							onclick={() => actions.framing.strategyToEpic(strategy.id)}>En faire une epic</Button
						>
					{/if}
					{#if strategy.hypothesisId}
						<span>→ pari à vérifier</span>
					{:else}
						<Button
							size="sm"
							icon={FlaskConical}
							onclick={() => actions.framing.strategyToHypothesis(strategy.id)}
							>En faire un pari</Button
						>
					{/if}
				</div>
			</div>
		{/each}
		<InlineAdd
			label="Ajouter une stratégie"
			placeholder="Ex. : offre « cabinet solo » à 19 €"
			onadd={(text) => actions.framing.addStrategy(project.id, kind, text)}
		/>
	</div>
{/snippet}

<!-- The SWOT is the rows' and columns' headers; the TOWS fills the crossings. -->
<div class="scrollbar-thin overflow-x-auto">
	<div class="grid min-w-[680px] grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] gap-3">
		<div></div>
		{@render family('S')}
		{@render family('W')}
		{@render family('O')}
		{@render cell('SO')}
		{@render cell('WO')}
		{@render family('T')}
		{@render cell('ST')}
		{@render cell('WT')}
	</div>
</div>
