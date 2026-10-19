import { describe, expect, it } from 'vitest';
import type { AvailabilitySlot, WorkBlock } from '$lib/modules/planning/domain/availability';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import {
	freeRanges,
	hourWindow,
	hoursLabel,
	personWeek,
	placeAt,
	placeTasks,
	spanLabel,
	tasksToPlace,
	typicalWeek,
	weekDeadlines
} from './week-plan';

// Week of Monday 12 October 2026.
const week = { from: new Date(2026, 9, 12), to: new Date(2026, 9, 19) };
const at = (day: number, hour: number, minute = 0) =>
	new Date(2026, 9, day, hour, minute).toISOString();
const slot = (
	day: number,
	from: number,
	to: number,
	status: AvailabilitySlot['status'] = 'available',
	userId = 'me'
): AvailabilitySlot => ({
	id: `s-${userId}-${day}-${from}`,
	userId,
	startsAt: at(day, from),
	endsAt: at(day, to),
	status
});
const block = (
	day: number,
	from: number,
	to: number,
	patch: Partial<WorkBlock> = {}
): WorkBlock => ({
	id: `b-${day}-${from}-${patch.projectId ?? 'saas'}`,
	projectId: 'saas',
	userId: 'me',
	taskId: null,
	startsAt: at(day, from),
	endsAt: at(day, to),
	...patch
});
const task = (id: string, patch: Partial<Task> = {}): Task => ({
	...newTask(
		{ id, projectId: 'saas', number: 1, title: id, position: 1 },
		'me',
		new Date(2026, 9, 1)
	),
	...patch
});

describe('hours of the week', () => {
	it('counts sure availability, planned work of every project and what is left', () => {
		const slots = [slot(13, 9, 12), slot(14, 14, 18), slot(15, 9, 12, 'maybe')];
		const blocks = [block(13, 9, 11), block(14, 14, 15, { projectId: 'client' }), block(16, 9, 10)];
		expect(personWeek('me', slots, blocks, week)).toEqual({
			available: 7 * 60,
			planned: 4 * 60,
			free: 4 * 60,
			byProject: [
				{ projectId: 'saas', minutes: 180 },
				{ projectId: 'client', minutes: 60 }
			]
		});
	});
});

describe('free time', () => {
	it('never lays over a block of another project', () => {
		const free = freeRanges(
			'me',
			[slot(13, 9, 12)],
			[block(13, 9, 10, { projectId: 'client' })],
			week.from,
			week.to
		);
		expect(free).toEqual([{ startsAt: at(13, 10), endsAt: at(13, 12) }]);
	});

	it('ignores "peut-être" and starts from now', () => {
		const slots = [slot(13, 9, 12), slot(14, 9, 12, 'maybe')];
		expect(freeRanges('me', slots, [], new Date(2026, 9, 13, 10, 5), week.to)).toEqual([
			{ startsAt: at(13, 10, 5), endsAt: at(13, 12) }
		]);
	});
});

describe('placing tasks', () => {
	const free = [
		{ startsAt: at(13, 9), endsAt: at(13, 10, 30) },
		{ startsAt: at(14, 14), endsAt: at(14, 18) }
	];

	it('takes 2 h at most, the room left when the slot ends sooner', () => {
		expect(placeTasks(['a', 'b', 'c'], free)).toEqual([
			{ taskId: 'a', startsAt: at(13, 9), endsAt: at(13, 10, 30) },
			{ taskId: 'b', startsAt: at(14, 14), endsAt: at(14, 16) },
			{ taskId: 'c', startsAt: at(14, 16), endsAt: at(14, 18) }
		]);
	});

	it('starts on a quarter hour and skips crumbs', () => {
		const odd = [
			{ startsAt: at(13, 9, 50), endsAt: at(13, 10, 10) },
			{ startsAt: at(13, 14, 5), endsAt: at(13, 15) }
		];
		expect(placeTasks(['a'], odd)).toEqual([
			{ taskId: 'a', startsAt: at(13, 14, 15), endsAt: at(13, 15) }
		]);
	});

	it('places nothing when nothing is free', () => {
		expect(placeTasks(['a'], [])).toEqual([]);
		expect(placeTasks(['a', 'b'], free.slice(0, 1))).toHaveLength(1);
	});

	it('fits a dropped task before the next block', () => {
		const blocks = [block(13, 11, 12)];
		expect(placeAt('me', blocks, new Date(2026, 9, 13, 10))).toEqual({
			startsAt: at(13, 10),
			endsAt: at(13, 11)
		});
		expect(placeAt('me', blocks, new Date(2026, 9, 13, 11, 30))).toBeNull();
	});
});

describe('what to place', () => {
	const ctx = {
		meId: 'me',
		projectId: 'saas',
		blocks: [] as WorkBlock[],
		week,
		currentStepId: 'step-1'
	};

	it('orders blocking bugs, deadlines, work under way, "Maintenant", the step under way', () => {
		const tasks = [
			task('plain', { position: 0 }),
			task('later-step', { milestoneId: 'step-2' }),
			task('step', { milestoneId: 'step-1' }),
			task('now', { quadrant: 'now' }),
			task('doing', { status: 'doing', assigneeId: 'me' }),
			task('due', { dueDate: '2026-10-16' }),
			task('late', { dueDate: '2026-10-02' }),
			task('bug', { kind: 'bug', critical: true })
		];
		expect(tasksToPlace(tasks, ctx).map((t) => t.id)).toEqual([
			'bug',
			'late',
			'due',
			'doing',
			'now',
			'step',
			'plain',
			'later-step'
		]);
	});

	it('leaves out what is placed, done, someone else’s or elsewhere', () => {
		const tasks = [
			task('placed'),
			task('free'),
			task('done', { status: 'done' }),
			task('idea', { status: 'idea' }),
			task('theirs', { assigneeId: 'cam' }),
			task('blocked', { blockedReason: 'Le client' }),
			task('other', { projectId: 'client' })
		];
		const blocks = [block(14, 9, 10, { taskId: 'placed', userId: 'cam' })];
		expect(tasksToPlace(tasks, { ...ctx, blocks }).map((t) => t.id)).toEqual(['free']);
	});
});

describe('the week at a glance', () => {
	it('lists the delivery, ends of steps and due tasks by day', () => {
		const step = { id: 'm', title: 'Bêta privée', targetDate: '2026-10-15', closedAt: null };
		const list = weekDeadlines(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'], {
			tasks: [
				task('t', { dueDate: '2026-10-15', number: 12 }),
				task('x', { dueDate: '2026-10-20' })
			],
			milestones: [step as Milestone, { ...step, id: 'closed', closedAt: at(1, 9) } as Milestone],
			deadline: '2026-10-13'
		});
		expect(list.map((d) => [d.day, d.title])).toEqual([
			['2026-10-13', 'Livraison du projet'],
			['2026-10-15', 'Fin : Bêta privée'],
			['2026-10-15', 't']
		]);
	});

	it('proposes a usual week of ten slots', () => {
		const slots = typicalWeek(week.from);
		expect(slots).toHaveLength(10);
		expect(slots[1]).toEqual({ startsAt: at(12, 14), endsAt: at(12, 18) });
	});

	it('opens the agenda at 7 h–21 h, wider only for what lies outside', () => {
		expect(hourWindow([])).toEqual({ from: 7, to: 21 });
		expect(hourWindow([{ start: 9 * 60, end: 12 * 60 }])).toEqual({ from: 7, to: 21 });
		expect(hourWindow([{ start: 6 * 60 + 30, end: 22 * 60 + 15 }])).toEqual({ from: 6, to: 23 });
	});

	it('says hours and spans the French way', () => {
		expect(hoursLabel(18 * 60)).toBe('18 h');
		expect(hoursLabel(150)).toBe('2 h 30');
		expect(hoursLabel(45)).toBe('45 min');
		expect(spanLabel({ startsAt: at(13, 9), endsAt: at(13, 11, 30) })).toBe('mar. 9 h–11 h 30');
	});
});
