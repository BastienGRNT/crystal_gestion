import type { Actions } from '$lib/client/actions';
import type { ProjectStore } from '$lib/client/project-store.svelte';
import { atMinutes, shiftIso } from '$lib/modules/planning/domain/calendar';
import type { AgendaItem, AgendaLayer } from '$lib/ui/organisms/agenda/types';

/** Turns grid gestures (minutes of a displayed day) into planning actions on real dates. */
export function agendaCommands(store: ProjectStore, planning: Actions['planning']) {
	return {
		create(day: Date, start: number, end: number, layer: AgendaLayer) {
			const from = atMinutes(day, start).toISOString();
			const to = atMinutes(day, end).toISOString();
			if (layer === 'availability') planning.createAvailability({ startsAt: from, endsAt: to });
			else planning.createBlock({ startedAt: from, endedAt: to });
		},
		change(item: AgendaItem, startShift: number, endShift: number) {
			if (item.layer === 'availability') {
				const slot = store.availabilities.get(item.id);
				if (!slot) return;
				const changes = {
					startsAt: shiftIso(slot.startsAt, startShift),
					endsAt: shiftIso(slot.endsAt, endShift)
				};
				planning.updateAvailability(item.id, changes);
			} else {
				const entry = store.timeEntries.get(item.id);
				if (!entry?.endedAt) return;
				const changes = {
					startedAt: shiftIso(entry.startedAt, startShift),
					endedAt: shiftIso(entry.endedAt, endShift)
				};
				planning.updateBlock(item.id, changes);
			}
		}
	};
}
