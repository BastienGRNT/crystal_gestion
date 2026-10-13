import { describe, expect, it } from 'vitest';
import { canMoveInto, pathTo, subtree, validFolderName, type Folder } from './folder';

const folder = (id: string, parentId: string | null): Folder => ({
	id,
	projectId: 'p',
	parentId,
	name: id,
	system: null,
	createdBy: 'u',
	createdAt: '2026-10-13T00:00:00Z'
});
const folders = [
	folder('design', null),
	folder('maquettes', 'design'),
	folder('v2', 'maquettes'),
	folder('compta', null)
];

describe('folders', () => {
	it('finds everything inside a folder', () => {
		expect(subtree(folders, 'design')).toEqual(['design', 'maquettes', 'v2']);
	});

	it('never moves a folder into itself', () => {
		expect(canMoveInto(folders, 'design', 'v2')).toBe(false);
		expect(canMoveInto(folders, 'v2', 'compta')).toBe(true);
		expect(canMoveInto(folders, 'v2', null)).toBe(true);
	});

	it('builds the breadcrumb', () => {
		expect(pathTo(folders, 'v2').map((f) => f.id)).toEqual(['design', 'maquettes', 'v2']);
	});

	it('refuses slashes in names', () => {
		expect(() => validFolderName('a/b')).toThrow(/«/);
	});
});
