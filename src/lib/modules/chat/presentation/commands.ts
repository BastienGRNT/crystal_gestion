import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { Chat } from '../index';

const message = {
	id,
	body: z.string(),
	fileIds: z.array(id).max(10).optional(),
	replyToId: id.nullable().optional()
};

export const chatCommands = (chat: Chat) => ({
	'chat.post': command(z.object({ ...message, channelId: id }), ({ userId }, input) =>
		chat.post(input, userId)
	),
	'chat.comment': command(z.object({ ...message, taskId: id }), ({ userId }, input) =>
		chat.comment(input, userId)
	),
	'chat.edit': command(z.object({ id, body: z.string() }), ({ userId }, input) =>
		chat.edit(input.id, input.body, userId)
	),
	'chat.delete': command(z.object({ id }), ({ userId }, input) => chat.delete(input.id, userId)),
	'chat.resolve': command(z.object({ id }), ({ userId }, input) =>
		chat.resolveQuestion(input.id, userId)
	),
	'chat.read': command(z.object({ channelId: id }), ({ userId }, input) =>
		chat.markRead(input.channelId, userId)
	),
	'channels.create': command(
		z.object({ id, projectId: id, name: z.string() }),
		({ userId }, input) => chat.createChannel(input, userId)
	),
	'channels.rename': command(z.object({ id, name: z.string() }), ({ userId }, input) =>
		chat.renameChannel(input.id, input.name, userId)
	),
	'channels.delete': command(z.object({ id }), ({ userId }, input) =>
		chat.deleteChannel(input.id, userId)
	)
});
