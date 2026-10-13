import type { User } from '$lib/modules/identity/domain/user';
import {
	availabilityNow,
	isOnDay,
	type AvailabilitySlot
} from '$lib/modules/planning/domain/availability';
import type { Task } from '$lib/modules/tasks/domain/task';
import { relativeTime, timeOf } from '../format';
import { WORK_STATUS } from '../labels';

export interface Presence {
	online: boolean;
	/** "En ligne" or "Vu il y a 2 h". */
	seen: string;
	status: string;
	statusDot: string;
	/** From the planning: "Dispo jusqu'à 23:00", "Dispo à 19:00"… `null` when nothing is planned today. */
	availability: string | null;
	today: AvailabilitySlot[];
	working: Task[];
}

export interface PresenceInput {
	online: string[];
	slots: AvailabilitySlot[];
	/** Tasks of the project being looked at. */
	tasks: Task[];
	now: Date;
}

function availabilityText(slots: AvailabilitySlot[], now: Date): string | null {
	const state = availabilityNow(slots, now);
	if (state.state === 'available')
		return `${state.maybe ? 'Peut-être dispo' : 'Dispo'} jusqu’à ${timeOf(state.until.toISOString())}`;
	if (state.state === 'later')
		return `${state.maybe ? 'Peut-être dispo' : 'Dispo'} à ${timeOf(state.from.toISOString())}`;
	return state.state === 'done' ? 'Plus dispo aujourd’hui' : null;
}

/** Is my teammate working, and on what: the answer to read at a glance when opening the app. */
export function presenceOf(user: User, input: PresenceInput): Presence {
	const online = input.online.includes(user.id);
	const mine = input.slots.filter((s) => s.userId === user.id);
	const meta = WORK_STATUS[user.status];
	return {
		online,
		seen: online
			? 'En ligne'
			: user.lastSeenAt
				? `Vu ${relativeTime(user.lastSeenAt, input.now)}`
				: 'Pas encore venu',
		status: user.statusNote ?? meta.label,
		statusDot: online ? meta.dot : 'bg-ink-4',
		availability: availabilityText(mine, input.now),
		today: mine
			.filter((s) => isOnDay(s, input.now))
			.sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
		working: input.tasks.filter((t) => t.status === 'doing' && t.assigneeId === user.id)
	};
}
