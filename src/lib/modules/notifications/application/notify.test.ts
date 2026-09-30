import { describe, expect, it, vi } from 'vitest';
import type { Notification } from '../domain/notification';
import { makeNotifier } from './notify';

const element = { id: 'e1', ref: 'T-1', kind: 'task' as const, title: 'Écrire' };
const actor = { id: 'me', name: 'Moi' };

describe('notifier', () => {
	it('never notifies the actor and pushes each notification', async () => {
		const insertMany = vi.fn(async (rows: object[]) =>
			rows.map((row, i) => ({ ...row, id: `${i}` }) as Notification)
		);
		const push = vi.fn();
		const notifier = makeNotifier({
			notifications: { insertMany, listForUser: vi.fn(), markRead: vi.fn() },
			pusher: { push }
		});
		await notifier.notify({
			type: 'assigned',
			projectId: 'p',
			actor,
			element,
			recipientIds: ['me', 'you', 'you']
		});
		expect(insertMany.mock.calls[0][0]).toHaveLength(1);
		expect(push).toHaveBeenCalledOnce();
	});

	it('does nothing when the actor is the only recipient', async () => {
		const insertMany = vi.fn();
		const notifier = makeNotifier({
			notifications: { insertMany, listForUser: vi.fn(), markRead: vi.fn() },
			pusher: { push: vi.fn() }
		});
		await notifier.notify({
			type: 'mention',
			projectId: 'p',
			actor,
			element,
			recipientIds: ['me']
		});
		expect(insertMany).not.toHaveBeenCalled();
	});
});
