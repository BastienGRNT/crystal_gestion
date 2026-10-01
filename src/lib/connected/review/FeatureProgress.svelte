<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { featureColors } from '$lib/client/views/feature-colors';
	import { byPriority, isArchived } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import ProgressBar from '$lib/ui/atoms/ProgressBar.svelte';
	import { isThisWeek } from '$lib/modules/kernel/domain/week';

	const { store, actions } = useProject();
	const colorOf = $derived(featureColors(store.features.items));
	const rows = $derived(
		store.features.items
			.filter((feature) => feature.priority !== 'wont' && !isArchived(feature))
			.sort(byPriority)
			.map((feature) => {
				const tasks = store.tasks.items.filter((task) => task.featureId === feature.id);
				const doneThisWeek = tasks.filter((task) =>
					isThisWeek(task.completedAt, new Date())
				).length;
				return { feature, progress: progressOf(tasks), doneThisWeek };
			})
	);
</script>

<div class="flex flex-col gap-3">
	{#each rows as { feature, progress, doneThisWeek } (feature.id)}
		<div
			class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[14rem_1fr_9rem]"
		>
			<a
				href="/p/{store.project.slug}/features/{feature.ref}"
				class="flex items-center gap-2 truncate font-medium hover:underline"
				><span class="size-2.5 shrink-0 rounded-[3px]" style="background:{colorOf(feature.id)}"
				></span>{feature.title}</a
			>
			<span class="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"
				><ProgressBar ratio={progress.ratio} label="Avancement de {feature.title}" /></span
			>
			{#if progress.total && progress.ratio === 1}
				<button
					type="button"
					onclick={() => actions.features.archive(feature.id, true)}
					class="text-right text-xs font-medium text-accent-text hover:underline"
					>Terminée · Archiver</button
				>
			{:else}
				<span class="text-right text-xs text-ink-3"
					>{progress.done}/{progress.total}{doneThisWeek
						? ` · +${doneThisWeek} cette semaine`
						: ''}</span
				>
			{/if}
		</div>
	{:else}
		<p class="text-sm text-ink-3">Aucune feature active.</p>
	{/each}
</div>
