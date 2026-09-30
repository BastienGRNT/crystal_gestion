import { useProject } from '$lib/client/context';
import { featureColors } from '$lib/client/views/feature-colors';
import { addDays } from '$lib/modules/planning/domain/calendar';
import { summarize } from '$lib/modules/time/domain/period-summary';
import type { AgendaView } from './agenda-view.svelte';

/** Time spent over the displayed period, per feature and per person: the planning legend. */
export function useTimeSummary(view: () => AgendaView, now: () => Date) {
	const { store, me } = useProject();
	const entries = $derived(
		store.timeEntries.items.filter((e) => view().audience === 'team' || e.userId === me.id)
	);
	const period = $derived({
		from: view().days[0],
		to: addDays(view().days.at(-1)!, 1),
		now: now()
	});
	const featureOfTask = (taskId: string | null) =>
		(taskId && store.tasks.get(taskId)?.featureId) || null;
	const colorOf = $derived(featureColors(store.features.items));
	const byFeature = $derived(
		summarize(entries, (e) => featureOfTask(e.taskId), period).map(({ key, minutes }) => ({
			...{ key: key ?? 'none', minutes, color: colorOf(key) },
			label: (key && store.features.get(key)?.title) || 'Sans feature'
		}))
	);
	const byPerson = $derived(
		summarize(entries, (e) => e.userId, period).map(({ key, minutes }) => {
			const member = store.members.get(key);
			return { key, minutes, label: member?.name ?? '?', color: member?.color ?? '' };
		})
	);
	return {
		get byFeature() {
			return byFeature;
		},
		get byPerson() {
			return byPerson;
		},
		get total() {
			return byFeature.reduce((sum, row) => sum + row.minutes, 0);
		}
	};
}
