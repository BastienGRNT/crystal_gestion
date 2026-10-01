import { collapseActivity } from '$lib/modules/activity/domain/collapse';
import type { Activity } from '$lib/modules/activity/domain/activity';
import type { TimeEntry } from '$lib/modules/time/domain/time-entry';

/** The task I last spent time on: where I was when I left. */
export function lastWorkedTaskId(entries: TimeEntry[], meId: string): string | null {
	const mine = entries.filter((e) => e.userId === meId && e.taskId);
	const latest = mine.sort((a, b) =>
		(b.endedAt ?? b.startedAt).localeCompare(a.endedAt ?? a.startedAt)
	)[0];
	return latest?.taskId ?? null;
}

export interface PersonDigest {
	actorId: string;
	/** « a terminé 3 tâches, écrit 2 messages ». */
	summary: string;
	items: Activity[];
}

const PHRASES: [verbs: Activity['verb'][], one: string, many: string][] = [
	[['completed'], 'terminé 1 tâche', 'terminé {n} tâches'],
	[['created'], 'créé 1 élément', 'créé {n} éléments'],
	[['posted'], 'écrit 1 message', 'écrit {n} messages'],
	[['archived'], 'archivé 1 feature', 'archivé {n} features'],
	[['updated', 'moved'], 'modifié 1 élément', 'modifié {n} éléments'],
	[['deleted'], 'supprimé 1 élément', 'supprimé {n} éléments']
];

export function summarize(items: Activity[]): string {
	const parts = PHRASES.map(([verbs, one, many]) => {
		const n = items.filter((item) => verbs.includes(item.verb)).length;
		return n === 0 ? null : n === 1 ? one : many.replace('{n}', String(n));
	}).filter(Boolean);
	return parts.length ? `a ${parts.join(', ')}` : '';
}

/** What each teammate did, most recent person first. Input: newest first. */
export function digestByPerson(activities: Activity[]): PersonDigest[] {
	const byActor = new Map<string, Activity[]>();
	for (const activity of collapseActivity(activities))
		byActor.set(activity.actorId, [...(byActor.get(activity.actorId) ?? []), activity]);
	return [...byActor].map(([actorId, items]) => ({ actorId, summary: summarize(items), items }));
}
