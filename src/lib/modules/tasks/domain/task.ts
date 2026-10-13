import { isDateKey, type DateKey } from '../../kernel/domain/dates';
import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * The board's flow, left to right. `idea` is the parked backlog; `review` is when the other one
 * checks the work (code review, a test on their phone) before it counts as done.
 */
export const TASK_STATUSES = ['idea', 'todo', 'doing', 'review', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** The four boxes of the Eisenhower matrix. `null` means "not sorted yet". */
export const QUADRANTS = ['now', 'plan', 'delegate', 'later'] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export interface ChecklistItem {
	id: string;
	text: string;
	done: boolean;
}

export interface Task {
	id: string;
	projectId: string;
	/** `#12` inside its project, to point at it in a message. */
	number: number;
	title: string;
	notes: string;
	status: TaskStatus;
	quadrant: Quadrant | null;
	assigneeId: string | null;
	/** Who checks the work while it is in review. */
	reviewerId: string | null;
	/** Why it is stuck (waiting for the client, a decision…). `null` when it moves. */
	blockedReason: string | null;
	checklist: ChecklistItem[];
	dueDate: DateKey | null;
	/** Fractional order shared by the board columns and the matrix boxes. */
	position: number;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	/** When it entered its current column, to spot what is stuck. */
	statusChangedAt: string;
	completedAt: string | null;
}

export type TaskPatch = Partial<
	Pick<
		Task,
		| 'title'
		| 'notes'
		| 'status'
		| 'quadrant'
		| 'assigneeId'
		| 'reviewerId'
		| 'blockedReason'
		| 'checklist'
		| 'dueDate'
		| 'position'
	>
>;

export const validTitle = (title: string) => requiredText(title, 'Le titre', 200);

export function validNotes(notes: string): string {
	ensure(notes.length <= 20_000, 'Les notes sont trop longues.');
	return notes;
}

export function validDueDate(dueDate: string | null): DateKey | null {
	ensure(dueDate === null || isDateKey(dueDate), 'Échéance invalide.');
	return dueDate;
}

export function validBlockedReason(reason: string | null): string | null {
	if (reason === null) return null;
	const text = reason.trim();
	ensure(text.length <= 200, 'La raison du blocage est trop longue (200 caractères maximum).');
	return text || 'Bloqué';
}

export function validChecklist(items: ChecklistItem[]): ChecklistItem[] {
	ensure(items.length <= 50, 'Une liste de 50 étapes maximum.');
	return items.map((item) => ({ ...item, text: requiredText(item.text, 'Une étape', 200) }));
}

/** On the matrix: what is still to do or under way. */
export const isActive = (task: Task) => task.status === 'todo' || task.status === 'doing';

export const isOpen = (task: Task) => task.status !== 'done' && task.status !== 'idea';

function clean(patch: TaskPatch): TaskPatch {
	return {
		...patch,
		...(patch.title !== undefined && { title: validTitle(patch.title) }),
		...(patch.notes !== undefined && { notes: validNotes(patch.notes) }),
		...(patch.dueDate !== undefined && { dueDate: validDueDate(patch.dueDate) }),
		...(patch.blockedReason !== undefined && {
			blockedReason: validBlockedReason(patch.blockedReason)
		}),
		...(patch.checklist !== undefined && { checklist: validChecklist(patch.checklist) })
	};
}

/**
 * Applies an edit and the rules that come with it: finishing stamps the date, reopening clears
 * it, starting or finishing a task nobody holds gives it to that person (so the team always
 * knows who did what), and a finished task is no longer blocked.
 */
export function applyPatch(task: Task, patch: TaskPatch, actorId: string, now: Date): Task {
	const next: Task = { ...task, ...clean(patch), updatedAt: now.toISOString() };
	if (patch.status === undefined || patch.status === task.status) return next;
	next.statusChangedAt = now.toISOString();
	next.completedAt = patch.status === 'done' ? now.toISOString() : null;
	if (patch.status === 'done') next.blockedReason = null;
	if (['doing', 'review', 'done'].includes(patch.status) && !next.assigneeId)
		next.assigneeId = actorId;
	return next;
}

export interface NewTaskInput {
	id: string;
	projectId: string;
	number: number;
	title: string;
	notes?: string;
	status?: TaskStatus;
	quadrant?: Quadrant | null;
	assigneeId?: string | null;
	dueDate?: string | null;
	checklist?: ChecklistItem[];
	position: number;
}

export function newTask(input: NewTaskInput, actorId: string, now: Date): Task {
	const status = input.status ?? 'todo';
	const at = now.toISOString();
	return {
		id: input.id,
		projectId: input.projectId,
		number: input.number,
		title: validTitle(input.title),
		notes: validNotes(input.notes ?? ''),
		status,
		quadrant: input.quadrant ?? null,
		assigneeId: input.assigneeId ?? (status === 'doing' || status === 'done' ? actorId : null),
		reviewerId: null,
		blockedReason: null,
		checklist: validChecklist(input.checklist ?? []),
		dueDate: validDueDate(input.dueDate ?? null),
		position: input.position,
		createdBy: actorId,
		createdAt: at,
		updatedAt: at,
		statusChangedAt: at,
		completedAt: status === 'done' ? at : null
	};
}

/** In a two-person team, review goes to the other one without asking. */
export function defaultReviewer(task: Task, members: string[], actorId: string): string | null {
	const others = members.filter((id) => id !== (task.assigneeId ?? actorId));
	return others.length === 1 ? others[0] : null;
}
