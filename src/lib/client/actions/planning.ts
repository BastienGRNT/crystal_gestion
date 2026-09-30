import type { Availability, AvailabilityStatus } from '$lib/modules/planning/domain/availability';
import type { TimeEntry } from '$lib/modules/time/domain/time-entry';
import { send } from '../commands';
import { draftId, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';
import { deleteWithUndo } from '../live/undoable';

type Range = { startsAt: string; endsAt: string };
type BlockRange = { startedAt: string; endedAt: string };

export function planningActions(store: ProjectStore, meId: string) {
	const projectId = () => store.project.id;
	return {
		createAvailability: (range: Range, status: AvailabilityStatus = 'available') =>
			createOptimistically<Availability>(
				store,
				'availability',
				{ id: draftId(), userId: meId, status, ...range },
				() => send('availability.create', { ...range, status })
			),
		updateAvailability: (id: string, changes: Partial<Range> & { status?: AvailabilityStatus }) =>
			optimistic(
				() => store.availabilities.patch(id, changes),
				() => send('availability.update', { id, changes })
			),
		removeAvailability: (id: string) =>
			optimistic(
				() => store.availabilities.remove(id),
				() => send('availability.delete', { id })
			),
		createBlock: (range: BlockRange, taskId: string | null = null) =>
			createOptimistically<TimeEntry>(
				store,
				'timeEntry',
				{ id: draftId(), projectId: projectId(), userId: meId, taskId, source: 'manual', ...range },
				() => send('time.createBlock', { projectId: projectId(), taskId, ...range })
			),
		updateBlock: (id: string, changes: Partial<BlockRange> & { taskId?: string | null }) =>
			optimistic(
				() => store.timeEntries.patch(id, changes),
				() => send('time.updateBlock', { id, changes })
			),
		removeBlock: (id: string) =>
			deleteWithUndo(
				'Bloc de temps supprimé',
				() => store.timeEntries.remove(id),
				() => send('time.deleteBlock', { id })
			),
		logTime: (taskId: string, minutes: number) =>
			send('time.log', { projectId: projectId(), taskId, minutes }).then((entry) =>
				store.upsert('timeEntry', entry)
			)
	};
}
