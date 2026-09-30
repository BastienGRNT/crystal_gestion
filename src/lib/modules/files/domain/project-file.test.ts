import { describe, expect, it } from 'vitest';
import { formatSize, previewKind } from './project-file';

describe('project files', () => {
	it('knows which files can be previewed', () => {
		expect(previewKind('image/png')).toBe('image');
		expect(previewKind('application/pdf')).toBe('pdf');
		expect(previewKind('application/zip')).toBeNull();
	});

	it('formats sizes', () => {
		expect(formatSize(512)).toBe('512 o');
		expect(formatSize(2048)).toBe('2 Ko');
		expect(formatSize(3.5 * 1024 * 1024)).toBe('3.5 Mo');
	});
});
