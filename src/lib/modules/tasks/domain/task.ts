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

/**
 * What kind of work it is, because a fix, a feature and a phone call do not count the same:
 * the changelog, the client report, the team's rhythm and the branch name all read it.
 */
export const TASK_KINDS = ['feature', 'bug', 'tech', 'action'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

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
	kind: TaskKind;
	/** A bug that blocks production or a client: it jumps the queue and warns everyone. */
	critical: boolean;
	/** Who reported it (a client, a pharmacy…), to tell them when it ships. */
	reportedBy: string | null;
	quadrant: Quadrant | null;
	assigneeId: string | null;
	/** Who checks the work while it is in review. */
	reviewerId: string | null;
	/** Why it is stuck (waiting for the client, a decision…). `null` when it moves. */
	blockedReason: string | null;
	checklist: ChecklistItem[];
	dueDate: DateKey | null;
	/** The step of the roadmap it belongs to, if any. */
	milestoneId: string | null;
	/** The part of the product it touches (site, appointments…), when the project has some. */
	componentId: string | null;
	/** The version it shipped in. Set by shipping, cleared when the task is reopened. */
	releaseId: string | null;
	/** The user story it builds, in the functional spec. Its epic is then the story's. */
	storyId: string | null;
	/** The epic it serves, for a task without a story. */
	epicId: string | null;
	/** A feature that is not part of the product (an internal setting…): never "à ranger". */
	outsideProduct: boolean;
	/** Fractional order shared by the board columns and the matrix boxes. */
	position: number;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	/** When it entered its current column, to spot what is stuck. */
	statusChangedAt: string;
	/** First time someone started it: the cycle time runs from here, pauses included. */
	startedAt: string | null;
	completedAt: string | null;
}

export type TaskPatch = Partial<
	Pick<
		Task,
		| 'title'
		| 'notes'
		| 'status'
		| 'kind'
		| 'critical'
		| 'reportedBy'
		| 'quadrant'
		| 'assigneeId'
		| 'reviewerId'
		| 'blockedReason'
		| 'checklist'
		| 'dueDate'
		| 'milestoneId'
		| 'componentId'
		| 'releaseId'
		| 'storyId'
		| 'epicId'
		| 'outsideProduct'
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

export function validReportedBy(text: string | null): string | null {
	const name = text?.trim() ?? '';
	ensure(name.length <= 80, 'Le nom de qui l’a signalé est trop long (80 caractères maximum).');
	return name || null;
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
		...(patch.checklist !== undefined && { checklist: validChecklist(patch.checklist) }),
		...(patch.reportedBy !== undefined && { reportedBy: validReportedBy(patch.reportedBy) })
	};
}

const STARTED: TaskStatus[] = ['doing', 'review', 'done'];

/** A task with a story belongs to the story's epic: the link is never stored twice. */
const framed = (task: Task): Task => (task.storyId ? { ...task, epicId: null } : task);

/** Only a bug can block; a bug that starts blocking goes straight to "Maintenant". */
function urgency(task: Task, wasCritical = false): Task {
	if (task.kind !== 'bug') return { ...task, critical: false };
	return task.critical && !wasCritical ? { ...task, quadrant: 'now' } : task;
}

/**
 * Applies an edit and the rules that come with it: finishing stamps the date, reopening clears
 * it, starting or finishing a task nobody holds gives it to that person (so the team always
 * knows who did what), and a finished task is no longer blocked.
 */
export function applyPatch(task: Task, patch: TaskPatch, actorId: string, now: Date): Task {
	const next = urgency(
		framed({ ...task, ...clean(patch), updatedAt: now.toISOString() }),
		task.critical
	);
	if (patch.status === undefined || patch.status === task.status) return next;
	next.statusChangedAt = now.toISOString();
	if (STARTED.includes(patch.status)) next.startedAt ??= now.toISOString();
	// Reopened work is no longer what shipped: it goes out again with a later version.
	if (task.status === 'done') next.releaseId = null;
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
	kind?: TaskKind;
	critical?: boolean;
	reportedBy?: string | null;
	quadrant?: Quadrant | null;
	assigneeId?: string | null;
	dueDate?: string | null;
	checklist?: ChecklistItem[];
	milestoneId?: string | null;
	componentId?: string | null;
	storyId?: string | null;
	epicId?: string | null;
	position: number;
}

export function newTask(input: NewTaskInput, actorId: string, now: Date): Task {
	const status = input.status ?? 'todo';
	const at = now.toISOString();
	return urgency(
		framed({
			id: input.id,
			projectId: input.projectId,
			number: input.number,
			title: validTitle(input.title),
			notes: validNotes(input.notes ?? ''),
			status,
			kind: input.kind ?? 'feature',
			critical: input.critical ?? false,
			reportedBy: validReportedBy(input.reportedBy ?? null),
			quadrant: input.quadrant ?? null,
			assigneeId: input.assigneeId ?? (status === 'doing' || status === 'done' ? actorId : null),
			reviewerId: null,
			blockedReason: null,
			checklist: validChecklist(input.checklist ?? []),
			dueDate: validDueDate(input.dueDate ?? null),
			milestoneId: input.milestoneId ?? null,
			componentId: input.componentId ?? null,
			releaseId: null,
			storyId: input.storyId ?? null,
			epicId: input.epicId ?? null,
			outsideProduct: false,
			position: input.position,
			createdBy: actorId,
			createdAt: at,
			updatedAt: at,
			statusChangedAt: at,
			startedAt: STARTED.includes(status) ? at : null,
			completedAt: status === 'done' ? at : null
		})
	);
}

/** In a two-person team, review goes to the other one without asking. */
export function defaultReviewer(task: Task, members: string[], actorId: string): string | null {
	const others = members.filter((id) => id !== (task.assigneeId ?? actorId));
	return others.length === 1 ? others[0] : null;
}
