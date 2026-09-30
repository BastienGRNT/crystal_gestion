import { mentionToken } from '$lib/modules/discussion/domain/mentions';

type Person = { id: string; name: string };

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Textareas show "@Ana"; the stored body uses stable "<@id>" tokens. Longest names win. */
export function encodeMentions(text: string, people: Person[]): string {
	const byLength = [...people].sort((a, b) => b.name.length - a.name.length);
	return byLength.reduce(
		(body, person) =>
			body.replace(
				new RegExp(`@${escape(person.name)}(?![\\p{L}\\d])`, 'gu'),
				mentionToken(person.id)
			),
		text
	);
}

export function decodeMentions(body: string, people: Person[]): string {
	return people.reduce(
		(text, person) => text.replaceAll(mentionToken(person.id), `@${person.name}`),
		body
	);
}
