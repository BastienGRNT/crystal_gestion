import { isDateKey, type DateKey } from '../../kernel/domain/dates';
import { ensure, requiredText } from '../../kernel/domain/errors';

/** `idea` is parked out of sight; the board shows the three others. */
export const TASK_STATUSES = ['idea', 'todo', 'doing', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** The four boxes of the Eisenhower matrix. `null` means "not sorted yet". */
export const QUADRANTS = ['now', 'plan', 'delegate', 'later'] as const;
export type Quadrant = (typeof QUADRANTS)[number];

export const QUADRANT_AXES: Record<Quadrant, { urgent: boolean; important: boolean }> = {
	now: { urgent: true, important: true },
	plan: { urgent: false, important: true },
	delegate: { urgent: true, important: false },
	later: { urgent: false, important: false }
};

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
	dueDate: DateKey | null;
	/** Fractional order shared by the board columns and the matrix boxes. */
	position: number;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	completedAt: string | null;
}

export type TaskPatch = Partial<
	Pick<Task, 'title' | 'notes' | 'status' | 'quadrant' | 'assigneeId' | 'dueDate' | 'position'>
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

export const isActive = (task: Task) => task.status === 'todo' || task.status === 'doing';

/**
 * Applies an edit and the rules that come with it: finishing stamps the date, reopening clears
 * it, and starting a task nobody holds gives it to the person who started it.
 */
export function applyPatch(task: Task, patch: TaskPatch, actorId: string, now: Date): Task {
	const next: Task = { ...task, ...patch, updatedAt: now.toISOString() };
	if (patch.title !== undefined) next.title = validTitle(patch.title);
	if (patch.notes !== undefined) next.notes = validNotes(patch.notes);
	if (patch.dueDate !== undefined) next.dueDate = validDueDate(patch.dueDate);
	if (patch.status === undefined || patch.status === task.status) return next;
	if (patch.status === 'done') next.completedAt = now.toISOString();
	else next.completedAt = null;
	if (patch.status === 'doing' && !next.assigneeId) next.assigneeId = actorId;
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
	position: number;
}

export function newTask(input: NewTaskInput, actorId: string, now: Date): Task {
	const status = input.status ?? 'todo';
	return {
		id: input.id,
		projectId: input.projectId,
		number: input.number,
		title: validTitle(input.title),
		notes: validNotes(input.notes ?? ''),
		status,
		quadrant: input.quadrant ?? null,
		assigneeId: input.assigneeId ?? (status === 'doing' ? actorId : null),
		dueDate: validDueDate(input.dueDate ?? null),
		position: input.position,
		createdBy: actorId,
		createdAt: now.toISOString(),
		updatedAt: now.toISOString(),
		completedAt: status === 'done' ? now.toISOString() : null
	};
}
