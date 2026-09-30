import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped } from '$lib/server/commands/schemas';
import type { AiModule } from '../application/notes';

const content = z.string().max(5000);

export const aiCommands = (ai: AiModule) => ({
	'aiNotes.create': defineCommand(projectScoped.extend({ content }), (actor, input) =>
		ai.create(actor, input)
	),
	'aiNotes.update': defineCommand(projectScoped.extend({ id, content }), (actor, input) =>
		ai.update(actor, input)
	),
	'aiNotes.delete': defineCommand(projectScoped.extend({ id }), (actor, input) =>
		ai.remove(actor, input)
	)
});
