import { describe, expect, it } from 'vitest';
import { emptyDraft, isDraftKind, toCreateInput } from './journal-draft';

describe('journal draft', () => {
	it('keeps only the fields of its kind and trims texts', () => {
		const decision = { ...emptyDraft('decision', ' Stripe ', '2026-09-30', 'u1'), problem: 'x' };
		expect(toCreateInput(decision)).toEqual({
			kind: 'decision',
			title: 'Stripe',
			featureId: null,
			details: { rationale: '', decidedBy: ['u1'], decidedOn: '2026-09-30' }
		});
		const fix = {
			...emptyDraft('fix', 'Flou', '2026-09-30', 'u1'),
			featureId: 'f1',
			cause: ' dpr '
		};
		expect(toCreateInput(fix).details).toEqual({ problem: '', cause: 'dpr', solution: '' });
		expect(toCreateInput(fix).featureId).toBe('f1');
	});

	it('only accepts creatable kinds from the URL', () => {
		expect(isDraftKind('fix')).toBe(true);
		expect(isDraftKind('scope')).toBe(false);
		expect(isDraftKind(null)).toBe(false);
	});
});
