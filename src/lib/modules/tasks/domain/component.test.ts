import { describe, expect, it } from 'vitest';
import { ensureParentFits, type Component } from './component';

const component = (id: string, parentId: string | null = null): Component => ({
	id,
	projectId: 'p',
	name: id,
	description: '',
	parentId,
	color: 0,
	position: 1,
	archivedAt: null,
	createdAt: ''
});

describe('the map of modules', () => {
	const all = [component('rdv'), component('agenda', 'rdv'), component('site')];

	it('has two levels, no more', () => {
		expect(() => ensureParentFits(all, 'x', 'agenda')).toThrow('Deux niveaux au plus');
		expect(() => ensureParentFits(all, 'rdv', 'site')).toThrow('a déjà des sous-modules');
		expect(() => ensureParentFits(all, 'site', 'site')).toThrow('Module parent inconnu');
		expect(() => ensureParentFits(all, 'site', 'rdv')).not.toThrow();
	});
});
