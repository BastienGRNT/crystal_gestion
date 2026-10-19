import { describe, expect, it } from 'vitest';
import type { Message } from '$lib/modules/chat/domain/chat';
import type { User } from '$lib/modules/identity/domain/user';
import type { WorkBlock } from '$lib/modules/planning/domain/availability';
import type { Member } from '$lib/modules/projects/domain/membership';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import {
	blockingBugs,
	dueWithin,
	myLiveProjects,
	myWork,
	nextByProject,
	projectGlances,
	questionsForMe,
	tasksIn,
	teammates,
	weekHours
} from './today';

// Monday 19 October 2026, 9 h.
const now = new Date(2026, 9, 19, 9);
const today = '2026-10-19';

const project = (id: string, patch: Partial<Project> = {}): Project => ({
	id,
	slug: id,
	name: id,
	description: '',
	color: 0,
	deadline: null,
	weekGoal: '',
	brief: '',
	soldDays: null,
	shipChecklist: [],
	archivedAt: null,
	createdBy: 'me',
	createdAt: `2026-01-0${id.length}T00:00:00Z`,
	...patch
});
const saas = project('saas');
const client = project('client', { createdAt: '2026-02-01T00:00:00Z' });
const old = project('old', { archivedAt: '2026-09-01T00:00:00Z' });

let n = 0;
const task = (patch: Partial<Task>): Task => ({
	...newTask(
		{ id: `t${++n}`, projectId: 'saas', number: n, title: `Tâche ${n}`, position: n },
		'me',
		now
	),
	...patch
});
const member = (projectId: string, userId: string, joinedAt = '2026-01-01T00:00:00Z'): Member => ({
	id: `${projectId}:${userId}`,
	projectId,
	userId,
	role: 'member',
	joinedAt
});
const user = (id: string): User => ({
	id,
	email: `${id}@crystal.test`,
	name: id,
	color: 0,
	status: 'available',
	statusNote: null,
	lastSeenAt: null,
	createdAt: '2026-01-01T00:00:00Z'
});
const step = (id: string, projectId: string, position: number, closed = false): Milestone => ({
	id,
	projectId,
	title: id,
	doneWhen: '',
	targetDate: null,
	position,
	componentId: null,
	closedAt: closed ? '2026-10-01T00:00:00Z' : null,
	closedBy: null,
	createdBy: 'me',
	createdAt: '2026-01-01T00:00:00Z'
});

describe('my day', () => {
	it('looks only at the live projects I belong to', () => {
		const members = [member('saas', 'me'), member('client', 'me'), member('old', 'me')];
		const others = project('others');
		expect(myLiveProjects([client, old, others, saas], members, 'me').map((p) => p.id)).toEqual([
			'saas',
			'client'
		]);
		const tasks = [task({ projectId: 'old' }), task({ projectId: 'client' }), task({})];
		expect(tasksIn([saas, client], tasks).map((t) => t.projectId)).toEqual(['saas', 'client']);
	});

	it('puts the blocking bugs first, the oldest on top, closed ones gone', () => {
		const bug = (createdAt: string, patch: Partial<Task> = {}) =>
			task({ kind: 'bug', critical: true, createdAt, ...patch });
		const recent = bug('2026-10-19T08:00:00Z');
		const older = bug('2026-10-18T08:00:00Z', { projectId: 'client' });
		const fixed = bug('2026-10-17T08:00:00Z', { status: 'done' });
		const minor = task({ kind: 'bug', createdAt: '2026-10-16T08:00:00Z' });
		expect(blockingBugs([recent, fixed, minor, older])).toEqual([older, recent]);
	});

	it('gathers what is in my hands and what is asked of me', () => {
		const doing = task({ status: 'doing', assigneeId: 'me' });
		const review = task({ status: 'review', assigneeId: 'cam', reviewerId: 'me' });
		const theirs = task({ status: 'doing', assigneeId: 'cam' });
		expect(myWork([doing, review, theirs], 'me')).toEqual({ doing: [doing], toReview: [review] });

		const question = (id: string, projectId: string, createdAt: string): Message => ({
			id,
			channelId: 'c',
			projectId,
			authorId: 'cam',
			body: '?',
			replyToId: null,
			createdAt,
			editedAt: null,
			attachments: [],
			asks: ['me'],
			answeredAt: null
		});
		const questions = [
			question('late', 'client', '2026-10-19T08:00:00Z'),
			question('archived', 'old', '2026-10-10T08:00:00Z'),
			question('first', 'saas', '2026-10-18T08:00:00Z')
		];
		expect(questionsForMe(questions, [saas, client], 'me').map((q) => q.id)).toEqual([
			'first',
			'late'
		]);
	});

	it('suggests the next task of each project, and skips the ones with nothing to take', () => {
		const milestones = [
			step('done', 'saas', 1, true),
			step('v1', 'saas', 2),
			step('v2', 'saas', 3)
		];
		const later = task({ quadrant: 'now', milestoneId: 'v2' });
		const current = task({ quadrant: 'plan', milestoneId: 'v1' });
		const bug = task({ kind: 'bug', critical: true });
		const taken = task({ projectId: 'client', assigneeId: 'cam' });
		const picks = nextByProject([saas, client], [later, current, bug, taken], milestones, 'me');
		expect(picks).toEqual([{ project: saas, task: current }]);
	});

	it('lists the deadlines of the coming week, late ones first', () => {
		const late = task({ dueDate: '2026-10-15' });
		const friday = task({ dueDate: '2026-10-23', projectId: 'client' });
		const tomorrow = task({ dueDate: '2026-10-20' });
		const far = task({ dueDate: '2026-10-27' });
		const done = task({ dueDate: '2026-10-20', status: 'done' });
		const idea = task({ dueDate: '2026-10-20', status: 'idea' });
		expect(dueWithin([friday, far, done, tomorrow, idea, late], today)).toEqual([
			late,
			tomorrow,
			friday
		]);
	});

	it('adds up the hours planned this week, every project together', () => {
		const block = (userId: string, day: number, from: number, to: number): WorkBlock => ({
			id: `${userId}-${day}-${from}`,
			projectId: day % 2 ? 'saas' : 'client',
			userId,
			taskId: null,
			startsAt: new Date(2026, 9, day, from).toISOString(),
			endsAt: new Date(2026, 9, day, to).toISOString()
		});
		const hours = weekHours(
			[
				block('cam', 19, 9, 12),
				block('cam', 22, 14, 18),
				// Last week and next week do not count; Sunday night is cut at midnight.
				block('cam', 18, 9, 12),
				block('cam', 26, 9, 12),
				block('me', 25, 22, 24),
				{ ...block('me', 25, 23, 24), endsAt: new Date(2026, 9, 26, 2).toISOString() }
			],
			now
		);
		expect(hours.get('cam')).toBe(7);
		expect(hours.get('me')).toBe(3);
	});

	it('lists each teammate once, across projects, without me', () => {
		const members = [
			member('saas', 'me'),
			member('client', 'leo', '2026-03-01T00:00:00Z'),
			member('saas', 'cam', '2026-02-01T00:00:00Z'),
			member('client', 'cam', '2026-02-02T00:00:00Z'),
			member('old', 'max')
		];
		const users = ['me', 'cam', 'leo', 'max'].map(user);
		expect(teammates([saas, client], members, users, 'me').map((u) => u.id)).toEqual([
			'cam',
			'leo'
		]);
	});

	it('sums up a project: current step, open bugs, days to the delivery', () => {
		const milestones = [
			step('done', 'saas', 1, true),
			step('v2', 'saas', 3),
			step('v1', 'saas', 2)
		];
		const tasks = [
			task({ kind: 'bug' }),
			task({ kind: 'bug', status: 'done' }),
			task({ kind: 'bug', projectId: 'client' })
		];
		const [first, second] = projectGlances(
			[{ ...saas, deadline: '2026-10-29' }, client],
			tasks,
			milestones,
			today
		);
		expect(first).toMatchObject({ step: { id: 'v1' }, openBugs: 1, deliveryIn: 10 });
		expect(second).toMatchObject({ step: null, openBugs: 1, deliveryIn: null });
	});
});
