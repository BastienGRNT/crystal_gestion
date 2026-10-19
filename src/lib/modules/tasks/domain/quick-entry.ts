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
}

export interface Named {
	id: string;
	name: string;
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
 * Reads "fix: login cassé @ana +site demain": a prefix says the kind (`bug!:` for a blocking
 * one; otherwise it is guessed), `@prénom` who does it, `+module` where, and a day at the end
 * the deadline. Dates are only read at the end so a title can still say "demain".
 */
export function parseQuickEntry(
	text: string,
	people: Person[],
	today: DateKey,
	meId?: string,
	components: Named[] = []
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
		componentId
	};
}
