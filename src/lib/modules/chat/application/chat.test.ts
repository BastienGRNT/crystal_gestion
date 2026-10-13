import { beforeEach, describe, expect, it } from 'vitest';
import {
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
	const reads = new Map<string, Date>();
	const notifier = new RecordingNotifier();
	const messageFeed = new RecordingFeed<Message>();
	const chat = createChat({
		clock: new FixedClock(),
		channelFeed: new RecordingFeed<Channel>(),
		messageFeed,
		activity: new RecordingActivity(),
		notifier,
		people: {
			names: async () =>
				new Map([
					[ana, 'Ana'],
					[bastien, 'Bastien']
				])
		},
		attachments: {
			attach: async (ids) =>
				ids.map((id) => ({ id, name: 'capture.png', mime: 'image/png', size: 10 }))
		},
		reads: {
			markRead: async (userId, channelId, at) => void reads.set(`${userId}:${channelId}`, at),
			states: async () => []
		},
		channels: {
			list: async () => channels.all(),
			get: async (id) => channels.get(id),
			findGeneral: async () => channels.all().find((c) => c.kind === 'general') ?? null,
			insert: async (c) => channels.put(c),
			save: async (c) => channels.put(c),
			delete: async (id) => channels.delete(id)
		},
		messages: {
			get: async (id) => messages.get(id),
			insert: async (m) => messages.put({ ...m, attachments: [] }),
			save: async (m) => messages.put(m),
			delete: async (id) => messages.delete(id),
			page: async () => messages.all()
		}
	});
	return { chat, notifier, reads, messageFeed };
}

describe('chat', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));

	it('creates the general channel once', async () => {
		const first = await ctx.chat.ensureGeneral(bastien);
		expect(await ctx.chat.ensureGeneral(ana)).toEqual(first);
	});

	it('notifies mentioned people, never the author', async () => {
		const general = await ctx.chat.ensureGeneral(bastien);
		await ctx.chat.post(
			{ id: testId(), channelId: general.id, body: `<@${ana}> <@${bastien}> tu relis ?` },
			bastien
		);
		expect(ctx.notifier.sent).toMatchObject([
			{ userId: ana, kind: 'mention', subject: { title: '@Ana @Bastien tu relis ?' } }
		]);
		expect(ctx.reads.has(`${bastien}:${general.id}`)).toBe(true);
	});

	it('posts a file alone and returns it attached', async () => {
		const general = await ctx.chat.ensureGeneral(bastien);
		const message = await ctx.chat.post(
			{ id: testId(), channelId: general.id, body: '', fileIds: ['f1'] },
			ana
		);
		expect(message.attachments.map((a) => a.id)).toEqual(['f1']);
	});

	it('lets only the author edit or delete', async () => {
		const general = await ctx.chat.ensureGeneral(bastien);
		const message = await ctx.chat.post(
			{ id: testId(), channelId: general.id, body: 'Salut' },
			ana
		);
		await expect(ctx.chat.edit(message.id, 'Hop', bastien)).rejects.toThrow(/auteur/);
		expect((await ctx.chat.edit(message.id, 'Salut !', ana)).editedAt).not.toBeNull();
		await ctx.chat.delete(message.id, ana);
		expect(ctx.messageFeed.removals).toEqual([message.id]);
	});

	it('protects the general and project channels', async () => {
		const general = await ctx.chat.ensureGeneral(bastien);
		await expect(ctx.chat.deleteTopic(general.id)).rejects.toThrow(/projet existe/);
		const topic = await ctx.chat.createTopic({ id: testId(), name: '#Design' }, ana);
		expect(topic.name).toBe('design');
		await ctx.chat.deleteTopic(topic.id);
	});
});
