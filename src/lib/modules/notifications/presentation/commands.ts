import { defineCommand } from '$lib/server/commands/define';
import { projectScoped } from '$lib/server/commands/schemas';
import type { NotificationsModule } from '..';

export const notificationCommands = (notifications: NotificationsModule) => ({
	'notifications.markAllRead': defineCommand(projectScoped, (actor, input) =>
		notifications.markAllRead(actor.id, input.projectId)
	)
});
