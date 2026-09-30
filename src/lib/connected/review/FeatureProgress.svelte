<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { byPriority } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import PriorityDot from '$lib/ui/atoms/PriorityDot.svelte';
	import ProgressBar from '$lib/ui/atoms/ProgressBar.svelte';
	import { isThisWeek } from '$lib/modules/kernel/domain/week';

	const { store } = useProject();
	const rows = $derived(
		store.features.items
			.filter((feature) => feature.priority !== 'wont')
			.sort(byPriority)
			.map((feature) => {
				const tasks = store.tasks.items.filter((task) => task.featureId === feature.id);
				const doneThisWeek = tasks.filter((task) => isThisWeek(task.completedAt, new Date())).length;
				return { feature, progress: progressOf(tasks), doneThisWeek };
			})
	);
</script>

<div class="flex flex-col gap-3">
	{#each rows as { feature, progress, doneThisWeek } (feature.id)}
		<a href="/p/{store.project.slug}/features/{feature.ref}" class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[14rem_1fr_7rem]">
			<span class="flex items-center gap-2 truncate font-medium"><PriorityDot priority={feature.priority} />{feature.title}</span>
			<span class="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"><ProgressBar ratio={progress.ratio} label="Avancement de {feature.title}" /></span>
			<span class="text-right font-mono text-[11.5px] text-ink-3">{progress.done}/{progress.total}{doneThisWeek ? ` · +${doneThisWeek}` : ''}</span>
		</a>
	{:else}
		<p class="text-[13px] text-ink-3">Aucune feature active.</p>
	{/each}
</div>
