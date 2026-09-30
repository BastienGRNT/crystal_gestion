import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { dateKey, id, projectScoped, text } from '$lib/server/commands/schemas';
import type { ProjectsModule } from '..';

const framing = z.object({
	name: z.string().trim().min(1).max(120),
	objective: text(500),
	audience: text(500),
	deadline: dateKey.nullable(),
	outOfScope: text(),
	doneDefinition: text()
});

export const projectCommands = (projects: ProjectsModule) => ({
	'projects.create': defineCommand(framing, (actor, input) => projects.create(actor, input)),
	'projects.updateFraming': defineCommand(
		projectScoped.extend({ changes: framing.partial() }),
		(_actor, input) => projects.updateFraming(input.projectId, input.changes)
	),
	'projects.createInvitation': defineCommand(projectScoped, (actor, input) =>
		projects.createInvitation(input.projectId, actor.id)
	),
	'projects.addMember': defineCommand(projectScoped.extend({ userId: id }), (_actor, input) =>
		projects.addMember(input.projectId, input.userId)
	)
});
