import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped } from '$lib/server/commands/schemas';
import type { DiscussionModule } from '..';

const body = z.string().max(20_000);
const target = projectScoped.extend({ id });

export const discussionCommands = (discussion: DiscussionModule) => ({
	'messages.post': defineCommand(
		projectScoped.extend({
			featureId: id.nullable(),
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
	'questions.resolve': defineCommand(projectScoped.extend({ messageId: id }), (actor, input) =>
		discussion.resolveQuestion(actor, input)
	)
});
