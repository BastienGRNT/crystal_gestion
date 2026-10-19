import type { z } from 'zod';
import { activityCommands } from '$lib/modules/activity/presentation/commands';
import { chatCommands } from '$lib/modules/chat/presentation/commands';
import { fileCommands } from '$lib/modules/files/presentation/commands';
import { identityCommands } from '$lib/modules/identity/presentation/commands';
import { planningCommands } from '$lib/modules/planning/presentation/commands';
import { projectCommands } from '$lib/modules/projects/presentation/commands';
import { roadmapCommands } from '$lib/modules/roadmap/presentation/commands';
import { taskCommands } from '$lib/modules/tasks/presentation/commands';
import { vaultCommands } from '$lib/modules/vault/presentation/commands';
import { container } from '../container';

/** Every write the client can send to `POST /api/commands/<name>`. */
export const commands = {
	...identityCommands(container.identity),
	...projectCommands(container.projects),
	...taskCommands(container.tasks),
	...chatCommands(container.chat),
	...fileCommands(container.files),
	...vaultCommands(container.vault),
	...planningCommands(container.planning),
	...roadmapCommands(container.roadmap),
	...activityCommands(container.activity)
};

export type Commands = typeof commands;
export type CommandName = keyof Commands;
export type CommandInput<N extends CommandName> = z.input<Commands[N]['input']>;
export type CommandOutput<N extends CommandName> = Awaited<ReturnType<Commands[N]['run']>>;
