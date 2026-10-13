import { describe, expect, it } from 'vitest';
import { byteRange } from './byte-range';
import { fileKind, formatSize, isActiveContent, validFileName } from './file';

describe('files', () => {
	it('recognizes what a file is from its type or extension', () => {
		expect(fileKind('image/png', 'logo.png')).toBe('image');
		expect(fileKind('application/pdf', 'devis.pdf')).toBe('pdf');
		expect(fileKind('application/octet-stream', 'maquette.fig')).toBe('design');
		expect(fileKind('', 'notes.md')).toBe('text');
		expect(fileKind('application/x-whatever', 'data.bin')).toBe('other');
	});

	it('strips any path from uploaded names', () => {
		expect(validFileName('../../etc/passwd')).toBe('passwd');
		expect(validFileName('C:\\Users\\ana\\cv.pdf')).toBe('cv.pdf');
		expect(() => validFileName('dossier/')).toThrow(/vide/);
	});

	it('never opens pages inline', () => {
		expect(isActiveContent('text/html')).toBe(true);
		expect(isActiveContent('image/svg+xml')).toBe(false);
		expect(isActiveContent('image/png')).toBe(false);
	});

	it('formats sizes the French way', () => {
		expect(formatSize(512)).toBe('512 o');
		expect(formatSize(1536)).toBe('1,5 Ko');
		expect(formatSize(25 * 1024 * 1024)).toBe('25 Mo');
	});
});

describe('byte ranges', () => {
	it('reads open and closed ranges', () => {
		expect(byteRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 });
		expect(byteRange('bytes=900-', 1000)).toEqual({ start: 900, end: 999 });
		expect(byteRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
	});

	it('reports impossible ranges and ignores garbage', () => {
		expect(byteRange('bytes=2000-', 1000)).toBe('unsatisfiable');
		expect(byteRange('items=0-1', 1000)).toBeNull();
		expect(byteRange(null, 1000)).toBeNull();
	});
});
