import type { Activity, Notification } from '$lib/modules/activity/domain/activity';
import type { ActivityVerb, Subject } from '$lib/modules/kernel/domain/subject';

const VERBS: Record<ActivityVerb, string> = {
	'project.created': 'a créé le projet',
	'member.joined': 'a rejoint le projet',
	'task.created': 'a ajouté',
	'task.started': 'a commencé',
	'task.review': 'a envoyé en revue',
	'task.done': 'a terminé',
	'task.blocked': 'est bloqué sur',
	'file.uploaded': 'a déposé',
	'vault.added': 'a ajouté l’accès',
	'channel.created': 'a ouvert le canal'
};

export const activityVerb = (activity: Activity) => VERBS[activity.verb] ?? 'a modifié';

export const notificationVerb = (notification: Notification) =>
	notification.kind === 'assigned'
		? 'te confie'
		: notification.kind === 'review'
			? 'te demande de relire'
			: 't’a mentionné';

/** Where clicking an activity or a notification leads. */
export function subjectHref(subject: Subject, slug: string | undefined): string {
	if (!slug) return '/projets';
	const base = `/p/${slug}`;
	switch (subject.kind) {
		case 'task':
			return `${base}/tableau?tache=${subject.id}`;
		case 'file':
			return `${base}/documents?fichier=${subject.id}`;
		case 'vault':
			return `${base}/acces`;
		case 'project':
			return base;
		case 'channel':
			return `${base}/discussion/${subject.id}`;
		case 'message':
			return `${base}/discussion/${subject.channelId}?message=${subject.id}`;
	}
}
