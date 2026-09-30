import { useProject } from '$lib/client/context';
import { minutesFrom, sameDay } from '$lib/modules/planning/domain/calendar';
import { agendaItems } from './agenda-items';
import { sharedBands } from './agenda-bands';
import type { AgendaView } from './agenda-view.svelte';

const TICK_MS = 30_000;

/** Live agenda content for the current view; `now` ticks so running timers grow on screen. */
export function useAgendaData(view: () => AgendaView) {
	const { store, me } = useProject();
	let now = $state(new Date());
	$effect(() => {
		const timer = setInterval(() => (now = new Date()), TICK_MS);
		return () => clearInterval(timer);
	});
	const team = $derived(view().audience === 'team');
	const members = $derived(
		[...store.members.items].sort((a, b) => Number(b.id === me.id) - Number(a.id === me.id))
	);
	const lanes = $derived(team ? members : members.filter((member) => member.id === me.id));
	const tasks = $derived(new Map(store.tasks.items.map((task) => [task.id, task])));
	const items = $derived(
		agendaItems({
			days: view().days,
			lanes,
			team,
			meId: me.id,
			now,
			availabilities: store.availabilities.items,
			entries: store.timeEntries.items,
			taskOf: (id) => (id ? tasks.get(id) : undefined)
		})
	);
	const nameOf = (id: string) => store.members.get(id)?.name ?? '';
	const bands = $derived(team ? sharedBands(view().days, store.availabilities.items, nameOf) : []);
	const marker = $derived.by(() => {
		const day = view().days.findIndex((d) => sameDay(d, now));
		return day === -1 ? null : { day, minutes: minutesFrom(view().days[day], now) };
	});
	const people = $derived(members.map((m) => ({ ...m, online: store.online.includes(m.id) })));
	return {
		get now() {
			return now;
		},
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
		get people() {
			return people;
		}
	};
}
