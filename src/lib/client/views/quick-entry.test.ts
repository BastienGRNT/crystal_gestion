import { describe, expect, it } from 'vitest';
import { parseQuickEntry } from './quick-entry';

// Thursday 1 October 2026.
const today = new Date(2026, 9, 1);
const known = {
	features: [
		{ id: 'f1', title: 'Boutique en ligne' },
		{ id: 'f2', title: 'Paiement Stripe' }
	],
	members: [
		{ id: 'ana', name: 'Ana' },
		{ id: 'leo', name: 'Léo' }
	],
	today
};
const parse = (text: string) => parseQuickEntry(text, known);

describe('parseQuickEntry', () => {
	it('keeps a plain title untouched', () => {
		expect(parse('Corriger le panier')).toEqual({
			title: 'Corriger le panier',
			assigneeIds: [],
			featureId: null,
			dueDate: null
		});
	});

	it('reads people, a feature and a date anywhere in the line', () => {
		expect(parse('Corriger @ana le panier #bout demain')).toEqual({
			title: 'Corriger le panier',
			assigneeIds: ['ana'],
			featureId: 'f1',
			dueDate: '2026-10-02'
		});
	});

	it('ignores accents and matches any word of a feature title', () => {
		const entry = parse('Brancher le webhook @leo #stripe');
		expect(entry.assigneeIds).toEqual(['leo']);
		expect(entry.featureId).toBe('f2');
	});

	it('leaves unknown tokens and references in the title', () => {
		expect(parse('Voir #T-12 avec @marc').title).toBe('Voir #T-12 avec @marc');
	});

	it('understands weekdays, next week and « dans N jours »', () => {
		expect(parse('Démo lundi').dueDate).toBe('2026-10-05');
		expect(parse('Démo jeudi').dueDate).toBe('2026-10-08');
		expect(parse('Démo semaine prochaine').dueDate).toBe('2026-10-05');
		expect(parse('Relancer dans 3 jours').dueDate).toBe('2026-10-04');
		expect(parse("Envoyer aujourd'hui").dueDate).toBe('2026-10-01');
	});

	it('does not read a date inside another word', () => {
		expect(parse('Lundis du design').dueDate).toBeNull();
	});
});
