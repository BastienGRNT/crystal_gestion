import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped } from '$lib/server/commands/schemas';
import type { DiscussionModule } from '..';

const body = z.string().max(20_000);
const target = projectScoped.extend({ id });
const name = z.string().max(80);

export const discussionCommands = (discussion: DiscussionModule) => ({
	'messages.post': defineCommand(
		projectScoped.extend({
			featureId: id.nullable(),
			channelId: id.nullable().default(null),
			body,
			replyToId: id.nullable().default(null),
			isQuestion: z.boolean().default(false)
		}),
		(actor, input) => discussion.post(actor, input)
	),
	'messages.edit': defineCommand(target.extend({ body }), (actor, input) =>
		discussion.edit(actor, input)
	),
	'messages.delete': defineCommand(target, (actor, input) => discussion.remove(actor, input)),
	'messages.markQuestion': defineCommand(
		target.extend({ isQuestion: z.boolean() }),
		(actor, input) => discussion.markQuestion(actor, input)
	),
	'channels.create': defineCommand(projectScoped.extend({ name }), (actor, input) =>
		discussion.channels.create(actor, input)
	),
	'channels.rename': defineCommand(target.extend({ name }), (actor, input) =>
		discussion.channels.rename(actor, input)
	),
	'channels.delete': defineCommand(target, (actor, input) =>
		discussion.channels.remove(actor, input)
	),
	'questions.resolve': defineCommand(projectScoped.extend({ messageId: id }), (actor, input) =>
		discussion.resolveQuestion(actor, input)
	)
});
