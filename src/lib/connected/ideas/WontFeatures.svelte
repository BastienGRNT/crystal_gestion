<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { projectPath } from '$lib/client/navigation';
	import IdeaSection from '$lib/ui/organisms/ideas/IdeaSection.svelte';
	import WontFeatureRow from '$lib/ui/organisms/ideas/WontFeatureRow.svelte';

	const { store, actions } = useProject();
	// Derived from the features themselves: a Won't is never copied, so it cannot drift.
	const postponed = $derived(store.features.items.filter((feature) => feature.priority === 'wont'));
	const href = (ref: string) => projectPath(store.project.slug, `/features/${ref}`);
</script>

<IdeaSection
	title="Features reportées"
	count={postponed.length}
	hint="Classées Won’t : pas maintenant, mais pas oubliées."
>
	{#if postponed.length}
		<ul>
			{#each postponed as feature (feature.id)}
				<WontFeatureRow
					feature={{ ...feature, href: href(feature.ref) }}
					onrestore={() => actions.features.update(feature.id, { priority: 'could' })}
				/>
			{/each}
		</ul>
	{:else}
		<p class="py-4 text-[13px] text-ink-3">
			Aucune feature en Won’t. Quand une feature sort du périmètre, elle attend ici.
		</p>
	{/if}
</IdeaSection>
