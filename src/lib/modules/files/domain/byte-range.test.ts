import { describe, expect, it } from 'vitest';
import { byteRange } from './byte-range';

describe('byte range', () => {
	it('reads start-end, open-ended and suffix ranges', () => {
		expect(byteRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 });
		expect(byteRange('bytes=900-', 1000)).toEqual({ start: 900, end: 999 });
		expect(byteRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
		expect(byteRange('bytes=500-5000', 1000)).toEqual({ start: 500, end: 999 });
	});

	it('sends the whole file without a usable header', () => {
		expect(byteRange(null, 1000)).toBeNull();
		expect(byteRange('bytes=-', 1000)).toBeNull();
		expect(byteRange('items=0-1', 1000)).toBeNull();
	});

	it('flags ranges outside the file', () => {
		expect(byteRange('bytes=1000-', 1000)).toBe('unsatisfiable');
		expect(byteRange('bytes=50-10', 1000)).toBe('unsatisfiable');
	});
});
