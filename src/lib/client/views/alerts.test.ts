import { describe, expect, it } from 'vitest';
import type { Activity, Notification } from '$lib/modules/activity/domain/activity';
import type { Channel, Message } from '$lib/modules/chat/domain/chat';
import type { User } from '$lib/modules/identity/domain/user';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { ServerEvent } from '$lib/shared/realtime';
import { alertFor, type AlertSource } from './alerts';

const ME = '00000000-0000-4000-8000-000000000001';
const ANA = '00000000-0000-4000-8000-000000000002';

const project = { id: 'p', slug: 'crystal', name: 'Crystal' } as Project;
const general = {
	id: 'c',
	projectId: 'p',
	kind: 'general',
	name: 'general',
	taskId: null
} as Channel;
const thread = { id: 't-c', projectId: 'p', kind: 'task', name: 'x', taskId: 't' } as Channel;
const task = { id: 't', projectId: 'p', title: 'Page de paiement' } as Task;

function source(known: { notifications?: string[]; messages?: string[] } = {}): AlertSource {
	const users = new Map([
		[ME, { id: ME, name: 'Bastien G' } as User],
		[ANA, { id: ANA, name: 'Ana Lopez' } as User]
	]);
	return {
		meId: ME,
		users,
		projects: new Map([['p', project]]),
		channels: new Map([
			['c', general],
			['t-c', thread]
		]),
		tasks: new Map([['t', task]]),
		notifications: new Map((known.notifications ?? []).map((id) => [id, { id } as Notification])),
		activities: new Map<string, Activity>(),
		knowsMessage: (id) => known.messages?.includes(id) ?? false
	};
}

const message = (over: Partial<Message> = {}): ServerEvent => ({
	type: 'saved',
	collection: 'messages',
	item: {
		id: 'm',
		channelId: 'c',
		projectId: 'p',
		authorId: ANA,
		body: 'On livre demain',
		replyToId: null,
		createdAt: '2026-10-14T09:00:00Z',
		editedAt: null,
		attachments: [],
		asks: [],
		answeredAt: null,
		...over
	}
});

const assigned: ServerEvent = {
	type: 'saved',
	collection: 'notifications',
	item: {
		id: 'n',
		userId: ME,
		projectId: 'p',
		actorId: ANA,
		kind: 'assigned',
		subject: { kind: 'task', id: 't', title: 'Page de paiement', projectId: 'p' },
		createdAt: '2026-10-14T09:00:00Z',
		readAt: null
	}
};

describe('desktop alerts', () => {
	it('tells me what is addressed to me, once, and opens it', () => {
		expect(alertFor(assigned, source(), 'mine')).toEqual({
			title: 'Ana te confie',
			body: 'Page de paiement · Crystal',
			href: '/p/crystal/tableau?tache=t',
			tag: 't'
		});
		expect(alertFor(assigned, source({ notifications: ['n'] }), 'mine')).toBeNull();
	});

	it('shares the team’s new messages only at the “all” level', () => {
		expect(alertFor(message(), source(), 'mine')).toBeNull();
		expect(alertFor(message(), source(), 'all')).toMatchObject({
			title: 'Ana dans #general',
			body: 'On livre demain · Crystal',
			href: '/p/crystal/discussion/c'
		});
	});

	it('names the task for a comment', () => {
		expect(alertFor(message({ channelId: 't-c' }), source(), 'all')).toMatchObject({
			title: 'Ana sur « Page de paiement »',
			href: '/p/crystal/tableau?tache=t'
		});
	});

	it('stays quiet on my own, edited, already known or mentioning messages', () => {
		const all = (event: ServerEvent, s = source()) => alertFor(event, s, 'all');
		expect(all(message({ authorId: ME }))).toBeNull();
		expect(all(message({ editedAt: '2026-10-14T09:05:00Z' }))).toBeNull();
		expect(all(message(), source({ messages: ['m'] }))).toBeNull();
		expect(all(message({ body: `<@${ME}> tu valides ?` }))).toBeNull();
	});

	it('says nothing when switched off', () => {
		expect(alertFor(assigned, source(), 'off')).toBeNull();
	});
});
