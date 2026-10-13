import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { Chat } from '../index';

export const chatCommands = (chat: Chat) => ({
	'chat.post': command(
		z.object({ id, channelId: id, body: z.string(), fileIds: z.array(id).max(10).optional() }),
		({ userId }, input) => chat.post(input, userId)
	),
	'chat.edit': command(z.object({ id, body: z.string() }), ({ userId }, input) =>
		chat.edit(input.id, input.body, userId)
	),
	'chat.delete': command(z.object({ id }), ({ userId }, input) => chat.delete(input.id, userId)),
	'chat.read': command(z.object({ channelId: id }), ({ userId }, input) =>
		chat.markRead(input.channelId, userId)
	),
	'channels.create': command(z.object({ id, name: z.string() }), ({ userId }, input) =>
		chat.createTopic(input, userId)
	),
	'channels.rename': command(z.object({ id, name: z.string() }), (_, input) =>
		chat.renameTopic(input.id, input.name)
	),
	'channels.delete': command(z.object({ id }), (_, input) => chat.deleteTopic(input.id))
});
