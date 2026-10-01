import { describe, expect, it, vi } from 'vitest';
import type { Message } from '../domain/message';
import { makePostMessage } from './post-message';

const ana = '11111111-1111-1111-1111-111111111111';
const actor = { id: '22222222-2222-2222-2222-222222222222', name: 'Bob' };

const setup = () => {
	const created = vi.fn(
		async (input: object) =>
			({
				...input,
				id: 'm1',
				ref: 'M-1',
				kind: 'message',
				createdAt: '',
				editedAt: null
			}) as Message
	);
	const deps = {
		messages: {
			create: created,
			update: vi.fn(),
			find: vi.fn(),
			delete: vi.fn(),
			listThread: vi.fn(),
			listAbout: vi.fn()
		},
		channels: {
			create: vi.fn(),
			rename: vi.fn(),
			delete: vi.fn(),
			find: vi.fn(async () => null),
			list: vi.fn()
		},
		questions: {
			open: vi.fn(async () => []),
			close: vi.fn(),
			resolve: vi.fn(async () => null),
			listOpen: vi.fn()
		},
		members: {
			names: async () =>
				new Map([
					[ana, 'Ana'],
					[actor.id, 'Bob']
				])
		},
		feed: { upserted: vi.fn(), deleted: vi.fn() },
		activity: { record: vi.fn() },
		notifier: { notify: vi.fn() },
		references: { sync: vi.fn() },
		clock: { now: () => new Date() }
	};
	return { deps, post: makePostMessage(deps) };
};
const base = { projectId: 'p', featureId: null, channelId: null, replyToId: null };

describe('post message', () => {
	it('turns a question with mentions into open questions and notifies', async () => {
		const { deps, post } = setup();
		await post(actor, { ...base, body: `<@${ana}> Stripe ou Paddle ?`, isQuestion: true });
		expect(deps.questions.open).toHaveBeenCalledWith('p', 'm1', [ana]);
		expect(deps.notifier.notify).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'question', recipientIds: [ana] })
		);
		expect(deps.messages.create).toHaveBeenCalledWith(
			expect.objectContaining({ title: '@Ana Stripe ou Paddle ?', mentionIds: [ana] })
		);
	});

	it('a question without anyone mentioned stays a plain message', async () => {
		const { deps, post } = setup();
		await post(actor, { ...base, body: 'Stripe ou Paddle ?', isQuestion: true });
		expect(deps.questions.open).not.toHaveBeenCalled();
	});

	it('replying resolves the question for the replier', async () => {
		const { deps, post } = setup();
		await post(actor, { ...base, body: 'Stripe.', isQuestion: false, replyToId: 'm0' });
		expect(deps.questions.resolve).toHaveBeenCalledWith('m0', actor.id, expect.any(Date));
	});

	it('a reply goes to the thread of the message it answers', async () => {
		const { deps, post } = setup();
		deps.messages.find.mockResolvedValue({ featureId: 'f1', channelId: null });
		await post(actor, { ...base, body: 'Oui.', isQuestion: false, replyToId: 'm0' });
		expect(deps.messages.create).toHaveBeenCalledWith(
			expect.objectContaining({ featureId: 'f1', channelId: null, replyToId: 'm0' })
		);
	});

	it('refuses a channel that does not exist', async () => {
		const { deps, post } = setup();
		await expect(
			post(actor, { ...base, channelId: 'c1', body: 'Salut', isQuestion: false })
		).rejects.toThrow('Canal inconnu');
		expect(deps.messages.create).not.toHaveBeenCalled();
	});
});
