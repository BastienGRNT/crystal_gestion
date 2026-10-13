import type { User } from '$lib/modules/identity/domain/user';
import type { Task } from '$lib/modules/tasks/domain/task';
import { firstName } from '$lib/client/format';
import { fold } from '$lib/client/views/search';

export interface Suggestion {
	key: string;
	label: string;
	detail?: string;
	/** What replaces the typed token. */
	insert: string;
	color?: number;
}

/** The `@ana` or `#12` being typed right before the caret, if any. */
export function tokenBefore(
	text: string,
	caret: number
): { trigger: '@' | '#'; query: string; start: number } | null {
	const match = text.slice(0, caret).match(/(^|\s)([@#])([^\s@#]*)$/);
	if (!match) return null;
	return { trigger: match[2] as '@' | '#', query: match[3], start: caret - match[3].length - 1 };
}

export function suggestionsFor(
	token: { trigger: '@' | '#'; query: string },
	people: User[],
	tasks: Task[]
): Suggestion[] {
	const query = fold(token.query);
	if (token.trigger === '@')
		return people
			.filter((p) =>
				fold(p.name)
					.split(/\s+/)
					.some((part) => part.startsWith(query))
			)
			.map((p) => ({ key: p.id, label: p.name, insert: `@${firstName(p.name)} `, color: p.color }));
	return tasks
		.filter(
			(t) =>
				t.status !== 'done' && (String(t.number).startsWith(query) || fold(t.title).includes(query))
		)
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
		.slice(0, 6)
		.map((t) => ({ key: t.id, label: t.title, detail: `#${t.number}`, insert: `#${t.number} ` }));
}
