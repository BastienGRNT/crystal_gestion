import type { Message } from '$lib/modules/chat/domain/chat';
import type { AvailabilitySlot } from '$lib/modules/planning/domain/availability';
import { sharedRanges } from '$lib/modules/planning/domain/shared';
import { daysInColumn, STALE_DAYS } from '$lib/modules/tasks/domain/views';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { Risk } from './forecast';

const HOUR_MS = 3_600_000;
/** Shorter than that, it is a coincidence, not a moment to talk. */
const MIN_MOMENT_MS = HOUR_MS / 2;

export interface Moment {
	start: Date;
	end: Date;
	/** The teammates there with me. */
	with: string[];
	/** It is happening right now. */
	ongoing: boolean;
}

/** The next moment this week when I and at least one teammate are surely available at once. */
export function nextMoment(
	slots: AvailabilitySlot[],
	meId: string,
	teammates: string[],
	now: Date
): Moment | null {
	const from = now.getTime();
	const to = from + 7 * 24 * HOUR_MS;
	const people = new Set([meId, ...teammates]);
	const spans = slots
		.filter((s) => s.status === 'available' && people.has(s.userId))
		.map((s) => ({
			owner: s.userId,
			start: Math.max(Date.parse(s.startsAt), from),
			end: Math.min(Date.parse(s.endsAt), to)
		}))
		.filter((s) => s.end > s.start);
	const range = sharedRanges(spans).find(
		(r) => r.owners.includes(meId) && r.end - r.start >= MIN_MOMENT_MS
	);
	if (!range) return null;
	return {
		start: new Date(range.start),
		end: new Date(range.end),
		with: range.owners.filter((id) => id !== meId),
		ongoing: range.start <= from
	};
}

export type AgendaKind = 'question' | 'review' | 'blocked' | 'risk' | 'sort' | 'stale';

export interface AgendaItem {
	kind: AgendaKind;
	/** What to open: a task, or the question's message. */
	taskId?: string;
	question?: Message;
	count?: number;
}

export interface AgendaInput {
	tasks: Task[];
	questions: Message[];
	risks: Map<string, Risk | null>;
	now: Date;
	/** At most that many items: a point is five minutes, not a meeting. */
	max?: number;
}

/**
 * What only gets solved together, already gathered: questions still open, work waiting for a
 * review, what is stuck, deadlines in danger, tasks nobody sorted and cards that stopped moving.
 */
export function agendaOf({ tasks, questions, risks, now, max = 6 }: AgendaInput): AgendaItem[] {
	const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'idea');
	const unsorted = open.filter((t) => t.status === 'todo' && t.quadrant === null).length;
	const items: AgendaItem[] = [
		...questions.map((question) => ({ kind: 'question' as const, question })),
		...open
			.filter((t) => t.status === 'review')
			.map((t) => ({ kind: 'review' as const, taskId: t.id })),
		...open.filter((t) => t.blockedReason).map((t) => ({ kind: 'blocked' as const, taskId: t.id })),
		...open
			.filter((t) => risks.get(t.id)?.tone === 'danger')
			.map((t) => ({ kind: 'risk' as const, taskId: t.id })),
		...(unsorted ? [{ kind: 'sort' as const, count: unsorted }] : []),
		...open
			.filter((t) => t.status === 'doing' && daysInColumn(t, now) >= STALE_DAYS)
			.map((t) => ({ kind: 'stale' as const, taskId: t.id }))
	];
	// A task shows once, for its most pressing reason.
	const seen = new Set<string>();
	const once = (item: AgendaItem) => {
		if (!item.taskId) return true;
		if (seen.has(item.taskId)) return false;
		seen.add(item.taskId);
		return true;
	};
	return items.filter(once).slice(0, max);
}
