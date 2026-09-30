import { aiCommands } from '$lib/modules/ai/presentation/commands';
import { discussionCommands } from '$lib/modules/discussion/presentation/commands';
import { featureCommands } from '$lib/modules/features/presentation/commands';
import { fileCommands } from '$lib/modules/files/presentation/commands';
import { ideaCommands } from '$lib/modules/ideas/presentation/commands';
import { identityCommands } from '$lib/modules/identity/presentation/commands';
import { journalCommands } from '$lib/modules/journal/presentation/commands';
import { notificationCommands } from '$lib/modules/notifications/presentation/commands';
import { planningCommands } from '$lib/modules/planning/presentation/commands';
import { projectCommands } from '$lib/modules/projects/presentation/commands';
import { resourceCommands } from '$lib/modules/resources/presentation/commands';
import { taskCommands } from '$lib/modules/tasks/presentation/commands';
import { timeCommands } from '$lib/modules/time/presentation/commands';
import type { Container } from '../container';

/** Every write the client can perform. Adding a module = spreading its commands here. */
export const buildCommands = (c: Container) => ({
	...identityCommands(c.identity),
	...projectCommands(c.projects),
	...featureCommands(c.features),
	...taskCommands(c.tasks),
	...timeCommands(c.time),
	...journalCommands(c.journal),
	...ideaCommands(c.ideas),
	...discussionCommands(c.discussion),
	...planningCommands(c.planning),
	...resourceCommands(c.resources),
	...fileCommands(c.files),
	...aiCommands(c.ai.notes),
	...notificationCommands(c.notifications)
});

export type CommandMap = ReturnType<typeof buildCommands>;
export type CommandName = keyof CommandMap;
