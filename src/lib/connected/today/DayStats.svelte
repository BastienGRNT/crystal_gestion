<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { TaskSources } from '$lib/client/views/task-sources.svelte';
	import { addDays, startOfWeek } from '$lib/modules/planning/domain/calendar';
	import { quadrantOf } from '$lib/modules/tasks/domain/eisenhower';
	import { minutesWithin } from '$lib/modules/time/domain/period-summary';
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import StatTile from '$lib/ui/molecules/StatTile.svelte';

	const { store, me } = useProject();
	const sources = new TaskSources(store);
	const base = $derived(`/p/${store.project.slug}`);
	const now = new Date();
	const [from, to] = [startOfWeek(now), addDays(startOfWeek(now), 7)];
	const urgent = $derived(
		store.tasks.items.filter(
			(t) =>
				t.status !== 'done' &&
				t.assigneeIds.includes(me.id) &&
				quadrantOf(t, sources.priorityOf(t.featureId), now) === 'do'
		).length
	);
	const minutes = $derived(
		store.timeEntries.items
			.filter((e) => e.userId === me.id)
			.reduce((sum, e) => sum + minutesWithin(e, from, to, now), 0)
	);
	const questions = $derived(
		store.questions.items.filter((q) => q.userId === me.id && !q.resolvedAt).length
	);
</script>

<div class="mb-10 grid grid-cols-3 gap-2 sm:gap-3 lg:max-w-3xl">
	<StatTile
		value={String(urgent)}
		label="à faire maintenant"
		href="{base}/tasks"
		emphasis={urgent > 0}
	/>
	<StatTile
		value={minutes ? formatMinutes(minutes) : '0 h'}
		label="cette semaine"
		href="{base}/planning?mode=work"
	/>
	<StatTile
		value={String(questions)}
		label="question{questions > 1 ? 's' : ''} pour toi"
		href="{base}/discussion"
		emphasis={questions > 0}
	/>
</div>
