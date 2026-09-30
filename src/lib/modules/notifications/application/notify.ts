import type { Notifier } from '$lib/modules/kernel/application/ports';
import { recipientsExcept } from '../domain/notification';
import type { NotificationPusher, NotificationRepository } from './ports';

export const makeNotifier = (deps: {
	notifications: NotificationRepository;
	pusher: NotificationPusher;
}): Notifier => ({
	async notify({ type, projectId, actor, element, recipientIds }) {
		const recipients = recipientsExcept(recipientIds, actor.id);
		if (recipients.length === 0) return;
		const created = await deps.notifications.insertMany(
			recipients.map((userId) => ({
				userId,
				projectId,
				type,
				actorId: actor.id,
				elementId: element.id,
				elementRef: element.ref,
				elementKind: element.kind,
				elementTitle: element.title
			}))
		);
		created.forEach((notification) => deps.pusher.push(notification));
	}
});
