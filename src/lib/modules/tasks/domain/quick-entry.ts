import { addDays, isDateKey, weekdayOf, type DateKey } from '../../kernel/domain/dates';
import { fold, guessKind, readPrefix } from './kind';
import type { TaskKind } from './task';

export interface Person {
	id: string;
	name: string;
}

export interface QuickEntry {
	title: string;
	assigneeId: string | null;
	dueDate: DateKey | null;
	kind: TaskKind;
	/** Said by a prefix (`fix:`), not guessed from the words. */
	kindSaid: boolean;
	critical: boolean;
	componentId: string | null;
	/** `~martin`: who reported it, completed from the names already used. */
	reportedBy: string | null;
	/** `^us-7`: the user story it builds. */
	storyId: string | null;
	/** `^paiement`: the epic it serves. */
	epicId: string | null;
}

/** An epic or a user story of the functional spec, as `^` finds them. */
export interface FramingTarget {
	id: string;
	kind: 'epic' | 'story';
	name: string;
	/** A story's `US-7`. */
	number?: number;
}

/** `^us-7` (or `^us7`) picks that story; `^paie` the epic whose name starts that way. */
export function findFramingTarget(query: string, targets: FramingTarget[]): FramingTarget | null {
	const story = query.match(/^us-?(\d+)$/i);
	if (story)
		return targets.find((t) => t.kind === 'story' && t.number === Number(story[1])) ?? null;
	const wanted = fold(query.replace(/_/g, ' '));
	if (!wanted) return null;
	const epics = targets.filter((t) => t.kind === 'epic');
	return (
		epics.find((t) => fold(t.name).startsWith(wanted)) ??
		epics.find((t) =>
			fold(t.name)
				.split(/\s+/)
				.some((w) => w.startsWith(wanted))
		) ??
		null
	);
}

export interface Named {
	id: string;
	name: string;
}

/** `~mart` → "Pharmacie Martin" when a known reporter has a word starting that way. */
export function findReporter(query: string, known: string[]): string {
	const wanted = fold(query.replace(/_/g, ' '));
	const match = known.find((name) =>
		fold(name)
			.split(/\s+/)
			.some((w) => w.startsWith(wanted))
	);
	return match ?? query.replace(/_/g, ' ');
}

/** `+rdv` picks the module whose name starts that way. */
export function findComponent(query: string, components: Named[]): Named | null {
	const wanted = fold(query);
	if (!wanted) return null;
	return components.find((c) => fold(c.name).startsWith(wanted)) ?? null;
}

const WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export function findPerson(query: string, people: Person[], meId?: string): Person | null {
	const wanted = fold(query);
	if (!wanted) return null;
	if (wanted === 'moi' && meId) return people.find((p) => p.id === meId) ?? null;
	return people.find((p) => fold(p.name).split(/\s+/)[0].startsWith(wanted)) ?? null;
}

/** Understands "demain", "vendredi", "15/11"… A weekday always means the next one to come. */
export function parseDay(word: string, today: DateKey): DateKey | null {
	const w = fold(word);
	if (w === "aujourd'hui" || w === 'auj') return today;
	if (w === 'demain') return addDays(today, 1);
	if (w === 'apres-demain') return addDays(today, 2);
	const weekday = WEEKDAYS.indexOf(w);
	if (weekday >= 0) return addDays(today, (weekday - weekdayOf(today) + 7) % 7 || 7);
	const match = w.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
	if (!match) return null;
	const [, day, month, year] = match;
	const pad = (n: string) => n.padStart(2, '0');
	const thisYear = Number(today.slice(0, 4));
	let key = `${year ?? thisYear}-${pad(month)}-${pad(day)}`;
	if (!year && key < today) key = `${thisYear + 1}-${pad(month)}-${pad(day)}`;
	return isDateKey(key) ? key : null;
}

/**
 * Reads "fix: login cassé @ana +site ~martin demain": a prefix says the kind (`bug!:` for a
 * blocking one; otherwise it is guessed), `@prénom` who does it, `+module` where, `~nom` who
 * reported it, `^epic` or `^us-7` what it builds, and a day at the end the deadline. Dates are only read at the end so a title can still say "demain".
 */
export function parseQuickEntry(
	text: string,
	people: Person[],
	today: DateKey,
	meId?: string,
	components: Named[] = [],
	reporters: string[] = [],
	targets: FramingTarget[] = []
): QuickEntry {
	let assigneeId: string | null = null;
	let dueDate: DateKey | null = null;
	let componentId: string | null = null;
	const prefix = readPrefix(text);
	const words = (prefix?.rest ?? text).trim().split(/\s+/).filter(Boolean);
	const plus = words.findIndex((w) => w.startsWith('+') && findComponent(w.slice(1), components));
	if (plus >= 0) {
		componentId = findComponent(words[plus].slice(1), components)!.id;
		words.splice(plus, 1);
	}
	let storyId: string | null = null;
	let epicId: string | null = null;
	const caret = words.findIndex((w) => w.startsWith('^') && findFramingTarget(w.slice(1), targets));
	if (caret >= 0) {
		const target = findFramingTarget(words[caret].slice(1), targets)!;
		if (target.kind === 'story') storyId = target.id;
		else epicId = target.id;
		words.splice(caret, 1);
	}
	let reportedBy: string | null = null;
	const tilde = words.findIndex((w) => w.startsWith('~') && w.length > 1);
	if (tilde >= 0) {
		reportedBy = findReporter(words[tilde].slice(1), reporters);
		words.splice(tilde, 1);
	}
	const mention = words.findIndex((w) => w.startsWith('@') && findPerson(w.slice(1), people, meId));
	if (mention >= 0) {
		assigneeId = findPerson(words[mention].slice(1), people, meId)!.id;
		words.splice(mention, 1);
	}
	const last = words.at(-1);
	const day = words.length > 1 && last ? parseDay(last, today) : null;
	if (day) {
		dueDate = day;
		words.pop();
	}
	const title = words.join(' ');
	return {
		title,
		assigneeId,
		dueDate,
		kind: prefix?.kind ?? guessKind(title),
		kindSaid: !!prefix,
		critical: prefix?.critical ?? false,
		componentId,
		reportedBy,
		storyId,
		epicId
	};
}
