import type { Activity, Notification } from '$lib/modules/activity/domain/activity';
import type { ActivityVerb, NotificationKind, Subject } from '$lib/modules/kernel/domain/subject';

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
	'channel.created': 'a ouvert le canal',
	'milestone.closed': 'a clos l’étape',
	'decision.made': 'a noté la décision'
};

export const activityVerb = (activity: Activity) => VERBS[activity.verb] ?? 'a modifié';

const NOTIFICATION_VERBS: Record<NotificationKind, string> = {
	assigned: 'te confie',
	review: 'te demande de relire',
	mention: 't’a mentionné',
	answer: 'a répondu à ta question :'
};

export const notificationVerb = (notification: Notification) =>
	NOTIFICATION_VERBS[notification.kind];

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
		case 'milestone':
			return `${base}/feuille-de-route#etape-${subject.id}`;
		case 'decision':
			return `${base}/feuille-de-route#decision-${subject.id}`;
	}
}
