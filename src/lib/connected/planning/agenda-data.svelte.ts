import type { AppContext } from '$lib/client/context';
import { tint } from '$lib/client/labels';
import { now } from '$lib/client/now.svelte';
import { minutesFrom, sameDay } from '$lib/modules/planning/domain/calendar';
import type { Project } from '$lib/modules/projects/domain/project';
import type { AgendaLane } from '$lib/ui/organisms/agenda/types';
import { teamOrder } from '../team/usePresence.svelte';
import { sharedBands } from './agenda-bands';
import { agendaItems } from './agenda-items';
import type { AgendaView } from './agenda-view.svelte';
import { dayMarks } from './day-marks';

/** Live agenda content of a project for the current view. */
export function useAgendaData({ app }: AppContext, project: () => Project, view: () => AgendaView) {
	const team = $derived(view().audience === 'team');
	const people = $derived(teamOrder(app, project().id));
	const lanes = $derived<AgendaLane[]>(
		(team ? people : people.filter((p) => p.id === app.meId)).map((p) => ({
			id: p.id,
			name: p.name.split(' ')[0],
			color: tint(p.color),
			colorIndex: p.color
		}))
	);
	const ids = $derived(new Set(lanes.map((l) => l.id)));
	const slots = $derived(app.slots.all.filter((s) => ids.has(s.userId)));
	const tasks = $derived(app.tasks.all.filter((t) => t.projectId === project().id));
	const byId = $derived(new Map(tasks.map((t) => [t.id, t])));
	const items = $derived(
		agendaItems({
			days: view().days,
			lanes,
			meId: app.meId,
			slots,
			blocks: app.blocks.all.filter((b) => b.projectId === project().id && ids.has(b.userId)),
			taskOf: (id) => (id ? byId.get(id) : undefined),
			isDraft: (id) => app.pending.has(id)
		})
	);
	const nameOf = (id: string) => app.users.get(id)?.name.split(' ')[0] ?? '';
	const bands = $derived(team ? sharedBands(view().days, slots, nameOf) : []);
	const marker = $derived.by(() => {
		const day = view().days.findIndex((d) => sameDay(d, now.value));
		return day === -1 ? null : { day, minutes: minutesFrom(view().days[day], now.value) };
	});
	const marks = $derived(
		dayMarks(view().days, {
			tasks,
			project: project(),
			people: lanes,
			color: tint(project().color),
			today: now.today
		})
	);
	return {
		get lanes() {
			return lanes;
		},
		get items() {
			return items;
		},
		get bands() {
			return bands;
		},
		get marker() {
			return marker;
		},
		get marks() {
			return marks;
		},
		get tasks() {
			return tasks;
		}
	};
}
