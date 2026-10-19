import type { AppContext } from '$lib/client/context';
import { plural } from '$lib/client/format';
import { toasts } from '$lib/client/toasts.svelte';
import { currentStepOf } from '$lib/client/views/roadmap';
import {
	DEFAULT_MINUTES,
	freeRanges,
	placeAt,
	placeTasks,
	spanLabel,
	tasksToPlace,
	type Placement,
	type Range
} from '$lib/client/views/week-plan';
import { addDays, atMinutes } from '$lib/modules/planning/domain/calendar';
import type { Project } from '$lib/modules/projects/domain/project';
import type { AgendaView } from './agenda-view.svelte';
import type { WeekSlots } from './week-slots.svelte';

const NO_ROOM =
	'Plus de dispo libre d’ici dimanche : dessine un créneau sur la grille, ou raccourcis un bloc.';

/** "Posée : mar. 9 h–12 h, mer. 14 h–15 h". */
const placed = (placements: Placement[]) => `Posée : ${placements.map(spanLabel).join(', ')}`;

/** My tasks to place this week, and the one-click ways to lay them in my free time. */
export function usePlacing(
	{ app, actions }: AppContext,
	project: () => Project,
	view: () => AgendaView,
	week: WeekSlots
) {
	const range = $derived({ from: view().week[0], to: addDays(view().week[0], 7) });
	const toPlace = $derived(
		tasksToPlace(app.tasks.all, {
			meId: app.meId,
			projectId: project().id,
			blocks: app.blocks.all,
			week: range,
			currentStepId: currentStepOf(app.milestones.all, project().id)?.id ?? null
		})
	);

	/** From now on: the past of the week is no place for new work. */
	const free = () =>
		freeRanges(
			app.meId,
			week.all,
			app.blocks.all,
			new Date(Math.max(Date.now(), range.from.getTime())),
			range.to
		);

	/** All the blocks of one gesture go (and are undone) together, once my week is stored. */
	function lay(placements: Placement[], done: string, none = NO_ROOM) {
		if (!placements.length) return void toasts.show(none);
		void week.edit(() => actions.planning.placeTasks(project().id, placements, done));
	}

	const kindOf = (taskId: string) => app.tasks.get(taskId)?.kind ?? 'feature';

	return {
		get toPlace() {
			return toPlace;
		},
		/** In my next free availability of the week, for the task's usual length. */
		place(taskId: string) {
			const placements = placeTasks([{ id: taskId, kind: kindOf(taskId) }], free());
			lay(placements, placed(placements));
		},
		/** Every task to place, in order, until my free time runs out. */
		proposeWeek() {
			const placements = placeTasks(toPlace, free());
			const count = new Set(placements.map((p) => p.taskId)).size;
			const left = toPlace.length - count;
			lay(
				placements,
				`${plural(count, 'tâche posée', 'tâches posées')}${left ? ` · ${left} sans place` : ''}`
			);
		},
		/** In the free part of a slot I tapped ("peut-être" included: I chose it). */
		placeIn(taskId: string, slot: Range) {
			const sure = [{ id: '', userId: app.meId, status: 'available' as const, ...slot }];
			const room = freeRanges(
				app.meId,
				sure,
				app.blocks.all,
				new Date(slot.startsAt),
				new Date(slot.endsAt)
			);
			const placements = placeTasks([{ id: taskId, kind: kindOf(taskId) }], room);
			lay(placements, placed(placements), 'Ce créneau est déjà rempli par d’autres blocs.');
		},
		/** Where a task row was dropped on the grid. */
		dropAt(day: number, minutes: number, taskId: string) {
			const start = atMinutes(view().days[day], minutes);
			const at = placeAt(app.meId, app.blocks.all, start, DEFAULT_MINUTES[kindOf(taskId)]);
			const placements = at ? [{ taskId, ...at }] : [];
			lay(placements, placed(placements), 'Il y a déjà un bloc à cette heure-là.');
		}
	};
}
