import { describe, expect, it } from 'vitest';
import { extractRefs, tokenize } from './refs';

describe('extractRefs', () => {
	it('finds unique refs in text', () => {
		expect(extractRefs('voir #T-12 et #F-3, encore #T-12')).toEqual(['T-12', 'F-3']);
	});

	it('ignores markdown-like hashes', () => {
		expect(extractRefs('# Titre et #tag et #t-1')).toEqual([]);
	});
});

describe('tokenize', () => {
	it('splits text around refs', () => {
		expect(tokenize('a #D-5 b')).toEqual([
			{ type: 'text', value: 'a ' },
			{ type: 'ref', ref: 'D-5' },
			{ type: 'text', value: ' b' }
		]);
	});
});
