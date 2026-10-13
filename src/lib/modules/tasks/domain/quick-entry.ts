import { addDays, isDateKey, weekdayOf, type DateKey } from '../../kernel/domain/dates';

export interface Person {
	id: string;
	name: string;
}

export interface QuickEntry {
	title: string;
	assigneeId: string | null;
	dueDate: DateKey | null;
}

const fold = (text: string) =>
	text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/’/g, "'").toLowerCase();

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
 * Reads "Corriger le login @ana demain": `@prénom` anywhere picks who does it, a day at the
 * end sets the deadline. Dates are only read at the end so a title can still say "demain".
 */
export function parseQuickEntry(
	text: string,
	people: Person[],
	today: DateKey,
	meId?: string
): QuickEntry {
	let assigneeId: string | null = null;
	let dueDate: DateKey | null = null;
	const words = text.trim().split(/\s+/).filter(Boolean);
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
	return { title: words.join(' '), assigneeId, dueDate };
}
