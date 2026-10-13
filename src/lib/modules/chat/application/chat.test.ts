import { beforeEach, describe, expect, it } from 'vitest';
import {
	FakeAccess,
	FixedClock,
	MemoryTable,
	RecordingActivity,
	RecordingFeed,
	RecordingNotifier,
	testId
} from '../../kernel/testing';
import type { Channel, Message } from '../domain/chat';
import { createChat } from '../index';

const bastien = '11111111-1111-4111-8111-111111111111';
const ana = '22222222-2222-4222-8222-222222222222';

function setup() {
	const channels = new MemoryTable<Channel>();
	const messages = new MemoryTable<Message>();
	const notifier = new RecordingNotifier();
	const messageFeed = new RecordingFeed<Message>();
	const chat = createChat({
		clock: new FixedClock(),
		channelFeed: new RecordingFeed<Channel>(),
		messageFeed,
		activity: new RecordingActivity(),
		notifier,
		access: new FakeAccess({ p1: [bastien, ana] }),
		people: {
			names: async () =>
				new Map([
					[ana, 'Ana'],
					[bastien, 'Bastien']
				])
		},
		tasks: { get: async (id) => ({ id, projectId: 'p1', title: 'Corriger le login' }) },
		attachments: {
			attach: async (ids) =>
				ids.map((id) => ({ id, name: 'capture.png', mime: 'image/png', size: 10 }))
		},
		reads: { markRead: async () => {}, states: async () => [] },
		channels: {
			ofProjects: async () => channels.all(),
			get: async (id: string) => channels.get(id),
			generalOf: async (projectId: string) =>
				channels.all().find((c) => c.projectId === projectId && c.kind === 'general') ?? null,
			ofTask: async (taskId: string) => channels.all().find((c) => c.taskId === taskId) ?? null,
			insert: async (c) => channels.put(c),
			save: async (c) => channels.put(c),
			delete: async (id: string) => channels.delete(id)
		},
		messages: {
			get: async (id: string) => messages.get(id),
			insert: async (m) => messages.put({ ...m, attachments: [] }),
			save: async (m) => messages.put(m),
			delete: async (id: string) => messages.delete(id),
			page: async () => messages.all()
		}
	});
	return { chat, notifier, messageFeed };
}

describe('chat', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));

	it('notifies mentioned people, never the author', async () => {
		const general = await ctx.chat.ensureGeneral('p1', bastien);
		await ctx.chat.post(
			{ id: testId(), channelId: general.id, body: `<@${ana}> <@${bastien}> tu relis ?` },
			bastien
		);
		expect(ctx.notifier.sent).toMatchObject([
			{ userId: ana, kind: 'mention', subject: { title: '@Ana @Bastien tu relis ?' } }
		]);
	});

	it('keeps a channel to its project team', async () => {
		const general = await ctx.chat.ensureGeneral('p1', bastien);
		await expect(
			ctx.chat.post({ id: testId(), channelId: general.id, body: 'Salut' }, 'paul')
		).rejects.toThrow(/ne fais pas partie/);
	});

	it('opens a task thread on its first comment, and mentions point to the task', async () => {
		await ctx.chat.comment(
			{ id: testId(), taskId: 't1', body: `<@${ana}> c’est corrigé ?` },
			bastien
		);
		await ctx.chat.comment({ id: testId(), taskId: 't1', body: 'Oui !' }, ana);
		expect(ctx.messageFeed.saves.map((m) => m.channelId)).toEqual([
			ctx.messageFeed.saves[0].channelId,
			ctx.messageFeed.saves[0].channelId
		]);
		expect(ctx.notifier.sent[0].subject).toMatchObject({ kind: 'task', id: 't1' });
	});

	it('lets only the author edit or delete', async () => {
		const general = await ctx.chat.ensureGeneral('p1', bastien);
		const message = await ctx.chat.post(
			{ id: testId(), channelId: general.id, body: 'Salut' },
			ana
		);
		await expect(ctx.chat.edit(message.id, 'Hop', bastien)).rejects.toThrow(/auteur/);
		await ctx.chat.delete(message.id, ana);
		expect(ctx.messageFeed.removals).toEqual([message.id]);
	});

	it('protects the general channel', async () => {
		const general = await ctx.chat.ensureGeneral('p1', bastien);
		await expect(ctx.chat.deleteChannel(general.id, bastien)).rejects.toThrow(/général/);
		const custom = await ctx.chat.createChannel(
			{ id: testId(), projectId: 'p1', name: 'Mise en prod' },
			ana
		);
		expect(custom.name).toBe('mise-en-prod');
		await ctx.chat.deleteChannel(custom.id, ana);
	});
});
