import { describe, expect, it } from 'vitest';
import { folderPath, type Folder } from './folder';

const folder = (id: string, parentId: string | null): Folder => ({
	id,
	projectId: 'p',
	featureId: null,
	parentId,
	name: id,
	createdAt: ''
});

describe('folder path', () => {
	it('lists folders from the root down', () => {
		const folders = [folder('a', null), folder('b', 'a'), folder('c', 'b')];
		expect(folderPath(folders, 'c').map((f) => f.id)).toEqual(['a', 'b', 'c']);
	});

	it('is empty at the root and stops on a missing parent', () => {
		expect(folderPath([folder('b', 'gone')], null)).toEqual([]);
		expect(folderPath([folder('b', 'gone')], 'b').map((f) => f.id)).toEqual(['b']);
	});
});
