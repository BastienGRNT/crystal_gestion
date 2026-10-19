import type { Message } from '$lib/modules/chat/domain/chat';
import type { User } from '$lib/modules/identity/domain/user';
import { addDays, daysBetween, type DateKey } from '$lib/modules/kernel/domain/dates';
import type { WorkBlock } from '$lib/modules/planning/domain/availability';
import { addDays as addCalendarDays, startOfWeek } from '$lib/modules/planning/domain/calendar';
import type { Member } from '$lib/modules/projects/domain/membership';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import { isOpen, type Task } from '$lib/modules/tasks/domain/task';
import { nextTasks } from './next-task';
import { currentStepOf } from './roadmap';
import { activeProjects } from './workspace';

const HOUR_MS = 3_600_000;

/** The projects "Ma journée" looks at: those I belong to and that still run. */
export function myLiveProjects(projects: Project[], members: Member[], meId: string): Project[] {
	const mine = new Set(members.filter((m) => m.userId === meId).map((m) => m.projectId));
	return activeProjects(projects).filter((p) => mine.has(p.id));
}

/** Tasks of those projects, in the order of the projects, then of the board. */
export function tasksIn(projects: Project[], tasks: Task[]): Task[] {
	const order = new Map(projects.map((p, i) => [p.id, i]));
	return tasks
		.filter((t) => order.has(t.projectId))
		.sort((a, b) => order.get(a.projectId)! - order.get(b.projectId)! || a.position - b.position);
}

export const isBlockingBug = (task: Task) => task.kind === 'bug' && task.critical && isOpen(task);

/** Bugs that stop a client or the production: the oldest has waited the longest. */
export const blockingBugs = (tasks: Task[]) =>
	tasks.filter(isBlockingBug).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

export interface MyWork {
	doing: Task[];
	toReview: Task[];
}

/** What is in my hands right now, all projects together. */
export const myWork = (tasks: Task[], meId: string): MyWork => ({
	doing: tasks.filter((t) => t.status === 'doing' && t.assigneeId === meId),
	toReview: tasks.filter((t) => t.status === 'review' && t.reviewerId === meId)
});

/** Questions waiting on my answer in these projects, the longest wait first. */
export function questionsForMe(questions: Message[], projects: Project[], meId: string) {
	const ids = new Set(projects.map((p) => p.id));
	return questions
		.filter((q) => ids.has(q.projectId) && q.asks.includes(meId))
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export interface NextPick {
	project: Project;
	task: Task;
}

/**
 * The task each project would suggest on its home page. Blocking bugs are left out: the banner
 * above already asks for them. A project with nothing to pick up is skipped.
 */
export function nextByProject(
	projects: Project[],
	tasks: Task[],
	milestones: Milestone[],
	meId: string
): NextPick[] {
	return projects.flatMap((project) => {
		const own = tasks.filter((t) => t.projectId === project.id && !isBlockingBug(t));
		const stepId = currentStepOf(milestones, project.id)?.id ?? null;
		const task = nextTasks(own, meId, stepId)[0];
		return task ? [{ project, task }] : [];
	});
}

/** Open tasks due within `days` (late ones included), the most overdue first. */
export function dueWithin(tasks: Task[], today: DateKey, days = 7): Task[] {
	const horizon = addDays(today, days);
	return tasks
		.filter((t) => isOpen(t) && t.dueDate !== null && t.dueDate <= horizon)
		.sort((a, b) => a.dueDate!.localeCompare(b.dueDate!) || a.number - b.number);
}

/** Hours each person planned on the week of `now` (Monday to Sunday), all projects. */
export function weekHours(blocks: WorkBlock[], now: Date): Map<string, number> {
	const from = startOfWeek(now).getTime();
	const to = addCalendarDays(startOfWeek(now), 7).getTime();
	const hours = new Map<string, number>();
	for (const block of blocks) {
		const start = Math.max(Date.parse(block.startsAt), from);
		const end = Math.min(Date.parse(block.endsAt), to);
		if (end <= start) continue;
		hours.set(block.userId, (hours.get(block.userId) ?? 0) + (end - start) / HOUR_MS);
	}
	return hours;
}

/** Everyone I work with in these projects, once, in the order they first joined; me left out. */
export function teammates(
	projects: Project[],
	members: Member[],
	users: User[],
	meId: string
): User[] {
	const ids = new Set(projects.map((p) => p.id));
	const order = members
		.filter((m) => ids.has(m.projectId) && m.userId !== meId)
		.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt))
		.map((m) => m.userId);
	return [...new Set(order)].flatMap((id) => users.find((u) => u.id === id) ?? []);
}

export interface ProjectGlance {
	project: Project;
	step: Milestone | null;
	openBugs: number;
	/** Days until the delivery (negative when past), `null` without a delivery date. */
	deliveryIn: number | null;
}

/** A project in one line: where it stands, what hurts, when it ships. */
export function projectGlances(
	projects: Project[],
	tasks: Task[],
	milestones: Milestone[],
	today: DateKey
): ProjectGlance[] {
	return projects.map((project) => ({
		project,
		step: currentStepOf(milestones, project.id),
		openBugs: tasks.filter((t) => t.projectId === project.id && t.kind === 'bug' && isOpen(t))
			.length,
		deliveryIn: project.deadline ? daysBetween(today, project.deadline) : null
	}));
}
