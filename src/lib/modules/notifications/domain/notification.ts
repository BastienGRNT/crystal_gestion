import type { NotificationType } from '$lib/modules/kernel/application/ports';
import type { ElementKind } from '$lib/modules/kernel/domain/element';

export interface Notification {
	id: string;
	userId: string;
	projectId: string;
	type: NotificationType;
	actorId: string;
	elementId: string | null;
	elementRef: string;
	elementKind: ElementKind;
	elementTitle: string;
	readAt: string | null;
	createdAt: string;
}

export const NOTIFICATION_VERBS: Record<NotificationType, string> = {
	mention: 't’a mentionné dans',
	question: 't’a posé une question dans',
	assigned: 't’a assigné',
	review: 'te demande de valider'
};

export const recipientsExcept = (recipientIds: string[], actorId: string) =>
	[...new Set(recipientIds)].filter((id) => id !== actorId);
