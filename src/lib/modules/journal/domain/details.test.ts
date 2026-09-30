import { describe, expect, it } from 'vitest';
import { decisionOf, fixOf, isScopeDetails } from './details';

describe('journal details', () => {
	const scope = { change: 'removed', priority: 'must', featureTitle: 'Export' } as const;

	it('fills missing decision and fix fields with defaults', () => {
		expect(decisionOf({ rationale: 'Moins de code' })).toEqual({
			rationale: 'Moins de code',
			decidedBy: [],
			decidedOn: null
		});
		expect(fixOf({ problem: 'Flou' })).toEqual({ problem: 'Flou', cause: '', solution: '' });
	});

	it('recognises scope changes and never reads them as texts', () => {
		expect(isScopeDetails(scope)).toBe(true);
		expect(isScopeDetails({ rationale: '' })).toBe(false);
		expect(fixOf(scope).problem).toBe('');
	});
});
