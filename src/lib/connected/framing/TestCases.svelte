<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { testCases } from '$lib/client/views/framing';
	import { storyRef } from '$lib/modules/framing/domain/framing';
	import type { Project } from '$lib/modules/projects/domain/project';

	let { project }: { project: Project } = $props();
	const { app } = useApp();

	const cases = $derived(testCases(app.stories.all.filter((s) => s.projectId === project.id)));
</script>

{#if cases.length}
	<div class="scrollbar-thin overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
		<table class="w-full min-w-[560px] text-sm">
			<thead class="text-left text-xs tracking-wide text-ink-3 uppercase">
				<tr>
					<th class="px-4 py-2 font-semibold">Story</th>
					<th class="px-2 py-2 font-semibold">Critère</th>
					<th class="px-2 py-2 font-semibold">Données</th>
					<th class="px-4 py-2 font-semibold">Résultat attendu</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-line">
				{#each cases as { story, criterion } (criterion.id)}
					<tr class="align-top">
						<td class="px-4 py-2 font-mono text-ink-3">{storyRef(story)}</td>
						<td class="px-2 py-2">{criterion.text}</td>
						<td class="px-2 py-2 text-ink-2">{criterion.data || '—'}</td>
						<td class="px-4 py-2 text-ink-2">{criterion.expected || '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-sm text-ink-3">
		Ouvre une story et clique sur la fiole à côté d’un critère pour lui donner ses données de test
		et le résultat attendu : ils se rassemblent ici.
	</p>
{/if}
