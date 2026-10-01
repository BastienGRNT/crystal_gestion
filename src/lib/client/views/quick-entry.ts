import { addDays, toDateKey } from '$lib/modules/kernel/domain/dates';

/** What a one-line entry says besides its title: « Corriger le panier @Ana #boutique demain ». */
export interface QuickEntry {
	title: string;
	assigneeIds: string[];
	featureId: string | null;
	dueDate: string | null;
}

interface Known {
	features: { id: string; title: string }[];
	members: { id: string; name: string }[];
	today: Date;
}

export const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const WEEKDAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Days from today for a spoken date, or null when the phrase is not a date. */
function daysFor(phrase: string, today: Date): number | null {
	const words = fold(phrase).replace(/[’']/g, '');
	if (words === 'aujourdhui') return 0;
	if (words === 'demain') return 1;
	if (words === 'apres-demain') return 2;
	if (words === 'semaine prochaine') return (8 - today.getDay()) % 7 || 7;
	const inDays = words.match(/^dans (\d{1,2}) jours?$/);
	if (inDays) return Number(inDays[1]);
	const weekday = WEEKDAYS.indexOf(words.replace(/ prochain$/, ''));
	return weekday === -1 ? null : (weekday - today.getDay() + 7) % 7 || 7;
}

const DATE_PATTERN =
	/(?:^|\s)(aujourd[’']?hui|apr[eè]s-demain|demain|semaine prochaine|dans \d{1,2} jours?|(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?: prochain)?)(?=\s|$)/i;

export const findMember = (members: Known['members'], word: string) =>
	members.find((m) => fold(m.name).startsWith(fold(word)));

/** A feature named by any word of its title: #bout → « Boutique en ligne ». */
export const findFeature = (features: Known['features'], word: string) =>
	features.find((f) =>
		fold(f.title)
			.split(/\s+/)
			.some((w) => w.startsWith(fold(word)))
	);

export function parseQuickEntry(text: string, known: Known): QuickEntry {
	let rest = ` ${text} `;
	const assigneeIds: string[] = [];
	let featureId: string | null = null;
	let dueDate: string | null = null;
	rest = rest.replace(/\s@([\p{L}-]+)/gu, (token, word: string) => {
		const member = findMember(known.members, word);
		if (!member) return token;
		if (!assigneeIds.includes(member.id)) assigneeIds.push(member.id);
		return ' ';
	});
	// `#T-12` stays a reference; `#mot` names a feature.
	rest = rest.replace(/\s#([\p{L}][\p{L}\d-]*)/gu, (token, word: string) => {
		const feature = findFeature(known.features, word);
		if (!feature) return token;
		featureId = feature.id;
		return ' ';
	});
	rest = rest.replace(DATE_PATTERN, (token, phrase: string) => {
		const days = daysFor(phrase, known.today);
		if (days === null) return token;
		dueDate = toDateKey(addDays(known.today, days));
		return ' ';
	});
	return { title: rest.replace(/\s+/g, ' ').trim(), assigneeIds, featureId, dueDate };
}

/** The word to write after `#` so that it names this feature and no other one. */
export function featureToken(feature: { id: string; title: string }, all: Known['features']) {
	const words = fold(feature.title).match(/[\p{L}][\p{L}\d-]*/gu) ?? [];
	const unique = words.find((word) => findFeature(all, word)?.id === feature.id);
	return unique ?? words[0] ?? '';
}
