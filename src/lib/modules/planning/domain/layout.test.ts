import { describe, expect, it } from 'vitest';
import { layoutColumns } from './layout';
import { sharedRanges } from './shared';

describe('layoutColumns', () => {
	it('keeps lone spans full width', () => {
		const placements = layoutColumns([
			{ id: 'a', start: 0, end: 60 },
			{ id: 'b', start: 60, end: 120 }
		]);
		expect(placements.get('a')).toEqual({ column: 0, columns: 1 });
		expect(placements.get('b')).toEqual({ column: 0, columns: 1 });
	});

	it('puts overlapping spans side by side and reuses freed columns', () => {
		const placements = layoutColumns([
			{ id: 'a', start: 0, end: 120 },
			{ id: 'b', start: 30, end: 60 },
			{ id: 'c', start: 90, end: 150 },
			{ id: 'd', start: 200, end: 260 }
		]);
		expect(placements.get('a')).toEqual({ column: 0, columns: 2 });
		expect(placements.get('b')).toEqual({ column: 1, columns: 2 });
		expect(placements.get('c')).toEqual({ column: 1, columns: 2 });
		expect(placements.get('d')).toEqual({ column: 0, columns: 1 });
	});
});

describe('sharedRanges', () => {
	it('finds when at least two people are available together', () => {
		const ranges = sharedRanges([
			{ owner: 'ana', start: 540, end: 720 },
			{ owner: 'ben', start: 600, end: 840 },
			{ owner: 'cam', start: 660, end: 900 }
		]);
		expect(ranges).toEqual([{ start: 600, end: 840, owners: ['ana', 'ben', 'cam'] }]);
	});

	it('ignores one person with overlapping slots of their own', () => {
		expect(
			sharedRanges([
				{ owner: 'ana', start: 540, end: 720 },
				{ owner: 'ana', start: 600, end: 840 }
			])
		).toEqual([]);
	});
});
