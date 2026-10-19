import type { AppContext } from '$lib/client/context';
import { withCarried } from '$lib/client/views/week-plan';
import type { Project } from '$lib/modules/projects/domain/project';
import { teamOrder } from '../team/usePresence.svelte';
import type { AgendaView } from './agenda-view.svelte';

/** Maps an id seen on screen (carried over or not) to the stored one. */
export type RealId = (id: string) => string;
export type WeekEdit = (run: (real: RealId) => unknown) => Promise<void>;

/**
 * The team's availability for the shown week, a week left empty reusing the last one that had
 * some. Mine is stored for real the moment I change anything in the week, before the change.
 */
export function useWeekSlots(
	{ app, actions }: AppContext,
	project: () => Project,
	view: () => AgendaView
) {
	const team = $derived(teamOrder(app, project().id).map((u) => u.id));
	const week = $derived(withCarried(app.slots.all, team, view().week[0]));
	let saving: Promise<Map<string, string> | null> | null = null;

	async function store(): Promise<Map<string, string> | null> {
		const mine = week.carried.get(app.meId);
		if (!mine) return new Map();
		const ids = new Map(mine.slots.map((s) => [s.id, crypto.randomUUID()]));
		const saved = await actions.planning.createSlots(
			mine.slots.map((s) => ({ ...s, id: ids.get(s.id) })),
			''
		);
		return saved ? ids : null;
	}

	// Gestures in a row share one save: the carried slots vanish from the screen at once.
	const materialize = () => (saving ??= store().finally(() => (saving = null)));

	const edit: WeekEdit = async (run) => {
		const ids = await materialize();
		if (ids) run((id) => ids.get(id) ?? id);
	};

	return {
		get all() {
			return week.slots;
		},
		/** Monday of the week someone's availability is carried from, if it is. */
		carriedFrom: (userId: string) => week.carried.get(userId)?.from,
		get mineCarried() {
			return week.carried.has(app.meId);
		},
		slot: (id: string) => week.slots.find((s) => s.id === id),
		edit
	};
}

export type WeekSlots = ReturnType<typeof useWeekSlots>;
