import { describe, expect, it } from 'vitest';
import type { User } from '$lib/modules/identity/domain/user';
import { dueLabel, relativeTime } from '../format';
import { toDisplay, toStored } from '../mentions';
import { rank, score } from './search';

const ana: User = {
	id: '22222222-2222-4222-8222-222222222222',
	email: 'ana@crystal.test',
	name: 'Ana Lefèvre',
	color: 1,
	status: 'available',
	statusNote: null,
	lastSeenAt: '2026-10-13T08:00:00Z',
	createdAt: '2026-01-01T00:00:00Z'
};

describe('search', () => {
	it('ignores accents and case, and needs every word', () => {
		expect(score('Déploiement de la prod', 'deploiement prod')).not.toBeNull();
		expect(score('Déploiement de la prod', 'deploiement staging')).toBeNull();
	});

	it('ranks word starts first and keeps a few per group', () => {
		const items = [
			{ group: 'Tâches', keywords: 'Relire le contrat' },
			{ group: 'Tâches', keywords: 'Contrat client' },
			{ group: 'Fichiers', keywords: 'contrat.pdf' }
		];
		expect(rank(items, 'contrat', 1).map((i) => i.keywords)).toEqual([
			'Contrat client',
			'contrat.pdf'
		]);
	});
});

describe('mentions', () => {
	it('stores first names as ids and shows them back', () => {
		const stored = toStored('@ana tu relis ? merci @paul', [ana]);
		expect(stored).toBe(`<@${ana.id}> tu relis ? merci @paul`);
		expect(toDisplay(stored, [ana])).toBe('@Ana tu relis ? merci @paul');
	});

	it('leaves emails alone', () => {
		expect(toStored('écris à contact@ana.fr', [ana])).toBe('écris à contact@ana.fr');
	});
});

describe('formats', () => {
	it('writes times and deadlines in plain French', () => {
		expect(dueLabel('2026-10-10', '2026-10-13')).toBe('En retard de 3 j');
		expect(dueLabel('2026-10-14', '2026-10-13')).toBe('Demain');
		expect(relativeTime('2026-10-13T09:58:00Z', new Date('2026-10-13T10:00:00Z'))).toBe(
			'il y a 2 min'
		);
	});
});
