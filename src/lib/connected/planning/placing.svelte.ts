import type { AppContext } from '$lib/client/context';
import { plural } from '$lib/client/format';
import { toasts } from '$lib/client/toasts.svelte';
import { currentStepOf } from '$lib/client/views/roadmap';
import {
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

const NO_ROOM =
	'Plus de dispo libre d’ici dimanche : dessine un créneau sur la grille, ou raccourcis un bloc.';

/** My tasks to place this week, and the one-click ways to lay them in my free time. */
export function usePlacing(
	{ app, actions }: AppContext,
	project: () => Project,
	view: () => AgendaView
) {
	const week = $derived({ from: view().week[0], to: addDays(view().week[0], 7) });
	const toPlace = $derived(
		tasksToPlace(app.tasks.all, {
			meId: app.meId,
			projectId: project().id,
			blocks: app.blocks.all,
			week,
			currentStepId: currentStepOf(app.milestones.all, project().id)?.id ?? null
		})
	);

	/** From now on: the past of the week is no place for new work. */
	const free = () =>
		freeRanges(
			app.meId,
			app.slots.all,
			app.blocks.all,
			new Date(Math.max(Date.now(), week.from.getTime())),
			week.to
		);

	function lay(placements: Placement[], done: string, none = NO_ROOM) {
		if (!placements.length) return toasts.show(none);
		actions.planning.placeTasks(project().id, placements, done);
	}

	const one = (placement: Placement | undefined, none?: string) =>
		lay(placement ? [placement] : [], placement ? `Posée ${spanLabel(placement)}` : '', none);

	return {
		get toPlace() {
			return toPlace;
		},
		/** In my next free availability of the week. */
		place: (taskId: string) => one(placeTasks([taskId], free())[0]),
		/** Every task to place, in order, until my free time runs out. */
		proposeWeek() {
			const placements = placeTasks(
				toPlace.map((t) => t.id),
				free()
			);
			const left = toPlace.length - placements.length;
			lay(
				placements,
				`${plural(placements.length, 'tâche posée', 'tâches posées')}${left ? ` · ${left} sans place` : ''}`
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
			one(placeTasks([taskId], room)[0], 'Ce créneau est déjà rempli par d’autres blocs.');
		},
		/** Where a task row was dropped on the grid. */
		dropAt(day: number, minutes: number, taskId: string) {
			const start = atMinutes(view().days[day], minutes);
			const range = placeAt(app.meId, app.blocks.all, start);
			one(range ? { taskId, ...range } : undefined, 'Il y a déjà un bloc à cette heure-là.');
		}
	};
}
