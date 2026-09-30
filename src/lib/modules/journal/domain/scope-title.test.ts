import { describe, expect, it } from 'vitest';
import { scopeTitle } from './scope-title';

describe('scopeTitle', () => {
	it('describes each kind of scope change', () => {
		expect(scopeTitle('Export', { change: 'added', priority: 'could' })).toBe(
			'Ajout de « Export » en Bonus'
		);
		expect(scopeTitle('Export', { change: 'removed', priority: 'could' })).toBe(
			'Retrait de « Export »'
		);
		expect(scopeTitle('Export', { change: 'reprioritized', from: 'must', to: 'wont' })).toBe(
			'« Export » : Indispensable → Pas maintenant'
		);
	});
});
