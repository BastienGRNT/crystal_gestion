import { requiredText } from '../../kernel/domain/errors';
import type { Task, TaskKind } from '../../tasks/domain/task';

/**
 * A version that went to production: a fact, never a plan (that is what steps are for).
 * Its texts are written when it ships, then kept as they were.
 */
export interface Release {
	id: string;
	projectId: string;
	name: string;
	shippedAt: string;
	/** For the team: new, fixed and technical, with task numbers. */
	changelog: string;
	/** For the clients: what changes for them, edited before shipping. */
	notes: string;
	createdBy: string;
	createdAt: string;
}

export const validReleaseName = (name: string) => requiredText(name, 'Le nom de la version', 40);

export const validReleaseNotes = (notes: string) => notes.trim().slice(0, 5000);

/** Done, made of code, and not shipped yet: what the next version would carry. */
export const shippable = (task: Pick<Task, 'status' | 'kind' | 'releaseId'>) =>
	task.status === 'done' && task.kind !== 'action' && !task.releaseId;

/**
 * The next name after `v1.3`: a minor step when something new ships, a patch for fixes only.
 * Starts at `v1.0`; a name it cannot read is left for the team to write.
 */
export function nextVersion(previous: string | null, kinds: TaskKind[]): string {
	if (!previous) return 'v1.0';
	const match = previous.match(/^(v?)(\d+)\.(\d+)(?:\.(\d+))?$/);
	if (!match) return '';
	const [, v, major, minor, patch] = match;
	return kinds.includes('feature')
		? `${v}${major}.${Number(minor) + 1}`
		: `${v}${major}.${minor}.${Number(patch ?? 0) + 1}`;
}

type Shipped = Pick<Task, 'number' | 'title' | 'kind' | 'reportedBy' | 'componentId'>;

const SECTIONS: [TaskKind, string][] = [
	['feature', 'Nouveautés'],
	['bug', 'Corrections'],
	['tech', 'Technique']
];

function line(task: Shipped, moduleOf: (id: string | null) => string | null, numbers: boolean) {
	const where = moduleOf(task.componentId);
	const by = numbers && task.reportedBy ? `, signalé par ${task.reportedBy}` : '';
	const ref = numbers ? ` (#${task.number}${by})` : '';
	return `- ${where ? `${where} : ` : ''}${task.title}${ref}`;
}

/** The team's changelog: everything that ships, grouped, with its number. */
export function changelogOf(
	name: string,
	tasks: Shipped[],
	moduleOf: (id: string | null) => string | null = () => null
): string {
	const parts = SECTIONS.flatMap(([kind, title]) => {
		const of = tasks.filter((t) => t.kind === kind);
		return of.length ? [`## ${title}`, ...of.map((t) => line(t, moduleOf, true)), ''] : [];
	});
	return [`# ${name}`, '', ...parts].join('\n').trim();
}

/** The clients' note: what changes for them, without the technical work nor the numbers. */
export function clientNoteOf(
	tasks: Shipped[],
	moduleOf: (id: string | null) => string | null = () => null
): string {
	const parts = SECTIONS.filter(([kind]) => kind !== 'tech').flatMap(([kind, title]) => {
		const of = tasks.filter((t) => t.kind === kind);
		return of.length ? [`## ${title}`, ...of.map((t) => line(t, moduleOf, false)), ''] : [];
	});
	return parts.join('\n').trim();
}

/** Who to tell: the people who reported the bugs this version fixes. */
export function toTell(tasks: Pick<Task, 'kind' | 'reportedBy'>[]): string[] {
	const names = tasks.filter((t) => t.kind === 'bug' && t.reportedBy).map((t) => t.reportedBy!);
	return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'fr'));
}
