import { addDays, daysBetween, parseDateKey, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { AvailabilitySlot } from '$lib/modules/planning/domain/availability';
import type { Task } from '$lib/modules/tasks/domain/task';
import { joinNames } from '../format';

/** Why a deadline might slip, in a few words, worded for the person reading it. */
export interface Risk {
	tone: 'danger' | 'warn';
	text: string;
}

export interface RiskContext {
	today: DateKey;
	now: Date;
	/** Everyone's availability: the planning says whether there is time left. */
	slots: AvailabilitySlot[];
	/** Who the task waits on (a question in its thread). */
	waitingOn: string[];
	meId: string;
	nameOf: (userId: string) => string;
}

const HOUR_MS = 3_600_000;
/** A task still to start this close to its deadline is a worry. */
const START_BY_DAYS = 2;

/** Hours someone is surely available between now and the end of the deadline day. */
function hoursBefore(slots: AvailabilitySlot[], userId: string, due: DateKey, now: Date) {
	const from = now.getTime();
	const to = parseDateKey(addDays(due, 1)).getTime();
	return slots
		.filter((s) => s.userId === userId && s.status === 'available')
		.reduce((sum, s) => {
			const start = Math.max(Date.parse(s.startsAt), from);
			const end = Math.min(Date.parse(s.endsAt), to);
			return sum + Math.max(0, end - start) / HOUR_MS;
		}, 0);
}

/** Only people who fill in the planning can be said to have no time. */
function usesPlanning(slots: AvailabilitySlot[], userId: string, now: Date) {
	const window = 14 * 24 * HOUR_MS;
	return slots.some(
		(s) => s.userId === userId && Math.abs(Date.parse(s.startsAt) - now.getTime()) < window
	);
}

/**
 * Crosses a deadline with what the app already knows: blocked, waiting for an answer, nobody on
 * it, no time in the planning of whoever must act, or not started yet. `null` when it looks fine.
 */
export function deadlineRisk(task: Task, ctx: RiskContext): Risk | null {
	if (!task.dueDate || task.status === 'done' || task.status === 'idea') return null;
	const days = daysBetween(ctx.today, task.dueDate);
	if (task.blockedReason) return { tone: 'danger', text: `Bloquée : ${task.blockedReason}` };
	if (ctx.waitingOn.length)
		return {
			tone: 'warn',
			text: `Attend la réponse de ${joinNames(ctx.waitingOn.map(ctx.nameOf))}`
		};
	const actor = task.status === 'review' ? task.reviewerId : task.assigneeId;
	if (!actor)
		return days <= 3 ? { tone: days <= 1 ? 'danger' : 'warn', text: 'Personne dessus' } : null;
	if (usesPlanning(ctx.slots, actor, ctx.now)) {
		const hours = hoursBefore(ctx.slots, actor, task.dueDate, ctx.now);
		const who = actor === ctx.meId ? 'Tu n’as' : `${ctx.nameOf(actor)} n’a`;
		if (hours === 0)
			return {
				tone: 'danger',
				text: `${who} pas de dispo${task.status === 'review' ? ' pour relire' : ''} d’ici là`
			};
		if (hours < 2 && task.status !== 'review')
			return { tone: 'warn', text: `${who} que ${Math.round(hours * 60)} min de dispo d’ici là` };
	}
	if (task.status === 'todo' && days <= START_BY_DAYS)
		return { tone: 'warn', text: 'Pas encore commencée' };
	return null;
}

export interface DeliveryForecast {
	open: number;
	perWeek: number;
	fits: boolean;
	/** Open tasks beyond what the team usually finishes before the date. */
	excess: number;
}

const PACE_DAYS = 28;
/** Below that, the pace says nothing yet. */
const MIN_DONE = 3;

/**
 * Will the open work fit before the delivery date at the pace of the last four weeks?
 * The only estimate that never needs anyone to estimate.
 */
export function deliveryForecast(
	tasks: Task[],
	deadline: DateKey,
	today: DateKey,
	now: Date
): DeliveryForecast | null {
	const since = now.getTime() - PACE_DAYS * 24 * HOUR_MS;
	const done = tasks.filter(
		(t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= since
	).length;
	const daysLeft = daysBetween(today, deadline);
	if (done < MIN_DONE || daysLeft < 0) return null;
	const perWeek = done / (PACE_DAYS / 7);
	const open = tasks.filter((t) => ['todo', 'doing', 'review'].includes(t.status)).length;
	const capacity = Math.floor((perWeek * daysLeft) / 7);
	return { open, perWeek, fits: open <= capacity, excess: Math.max(0, open - capacity) };
}
