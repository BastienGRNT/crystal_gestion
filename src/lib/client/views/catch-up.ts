import { collapseActivity } from '$lib/modules/activity/domain/collapse';
import type { Activity } from '$lib/modules/activity/domain/activity';
import type { ElementKind } from '$lib/modules/kernel/domain/element';
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

const NOUNS = {
	task: ['tâche', 'tâches'],
	feature: ['feature', 'features'],
	idea: ['idée', 'idées'],
	decision: ['décision', 'décisions'],
	file: ['fichier', 'fichiers'],
	other: ['autre élément', 'autres éléments']
} as const;
type Noun = keyof typeof NOUNS;
const nounOf = (kind: ElementKind): Noun => (kind in NOUNS ? (kind as Noun) : 'other');

const count = (n: number, noun: Noun) => `${n} ${NOUNS[noun][n > 1 ? 1 : 0]}`;

/** « a, b et c ». */
const list = (parts: string[]) =>
	parts.length > 1 ? `${parts.slice(0, -1).join(', ')} et ${parts.at(-1)}` : parts[0];

/** « créé 2 tâches, 1 idée et 3 autres éléments »: what was created, by kind. */
function created(items: Activity[]) {
	const nouns = (Object.keys(NOUNS) as Noun[]).filter((noun) =>
		items.some((i) => nounOf(i.elementKind) === noun)
	);
	const parts = nouns.map((noun) =>
		count(items.filter((i) => nounOf(i.elementKind) === noun).length, noun)
	);
	return `créé ${list(parts)}`;
}

const PHRASES: [verbs: Activity['verb'][], phrase: (items: Activity[]) => string | null][] = [
	[['completed'], (items) => `terminé ${count(items.length, 'task')}`],
	[['created'], created],
	[['posted'], (items) => `écrit ${items.length} message${items.length > 1 ? 's' : ''}`],
	[['archived'], (items) => `archivé ${count(items.length, 'feature')}`],
	[
		['updated', 'moved'],
		(items) => `modifié ${items.length} élément${items.length > 1 ? 's' : ''}`
	],
	[['deleted'], (items) => `supprimé ${items.length} élément${items.length > 1 ? 's' : ''}`]
];

export function summarize(items: Activity[]): string {
	const parts = PHRASES.map(([verbs, phrase]) => {
		const matching = items.filter((item) => verbs.includes(item.verb));
		return matching.length ? phrase(matching) : null;
	}).filter(Boolean);
	return parts.length ? `a ${parts.join(' · ')}` : '';
}

/** What each teammate did, most recent person first. Input: newest first. */
export function digestByPerson(activities: Activity[]): PersonDigest[] {
	const byActor = new Map<string, Activity[]>();
	for (const activity of collapseActivity(activities))
		byActor.set(activity.actorId, [...(byActor.get(activity.actorId) ?? []), activity]);
	return [...byActor].map(([actorId, items]) => ({ actorId, summary: summarize(items), items }));
}
