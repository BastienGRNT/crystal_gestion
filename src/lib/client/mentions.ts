import type { User } from '$lib/modules/identity/domain/user';
import { firstName } from './format';

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * People type "@Ana"; messages store `<@id>` so a rename never breaks them.
 * First names are enough to tell a small team apart.
 */
export function toStored(text: string, people: User[]): string {
	return text.replace(/(^|[\s(])@([\p{L}\p{N}_-]+)/gu, (match, before: string, name: string) => {
		const person = people.find((p) => fold(firstName(p.name)) === fold(name));
		return person ? `${before}<@${person.id}>` : match;
	});
}

export function toDisplay(body: string, people: User[]): string {
	return body.replace(/<@([0-9a-f-]{36})>/g, (match, id: string) => {
		const person = people.find((p) => p.id === id);
		return person ? `@${firstName(person.name)}` : match;
	});
}
