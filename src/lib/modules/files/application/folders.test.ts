import { describe, expect, it, vi } from 'vitest';
import type { Folder } from '../domain/folder';
import { makeFolderUseCases } from './folders';

const design: Folder = {
	id: 'd',
	projectId: 'p',
	featureId: 'f1',
	parentId: null,
	name: 'Design',
	createdAt: ''
};

const setup = (empty = true) => {
	const folders = {
		create: vi.fn(async (input: Omit<Folder, 'id' | 'createdAt'>) => ({
			...input,
			id: 'new',
			createdAt: ''
		})),
		rename: vi.fn(),
		delete: vi.fn(async () => true),
		find: vi.fn(async () => design),
		list: vi.fn(),
		isEmpty: vi.fn(async () => empty)
	};
	const feed = { upserted: vi.fn(), deleted: vi.fn() };
	return { folders, feed, useCases: makeFolderUseCases({ folders, feed }) };
};
const actor = { id: 'u', name: 'U' };

describe('folders', () => {
	it('puts a sub-folder in the same root as its parent', async () => {
		const { useCases } = setup();
		const folder = await useCases.create(actor, {
			projectId: 'p',
			featureId: null,
			parentId: 'd',
			name: ' Logos '
		});
		expect(folder).toMatchObject({ featureId: 'f1', parentId: 'd', name: 'Logos' });
	});

	it('refuses to delete a folder that still holds something', async () => {
		const { useCases, folders } = setup(false);
		await expect(useCases.remove(actor, { projectId: 'p', id: 'd' })).rejects.toThrow();
		expect(folders.delete).not.toHaveBeenCalled();
	});
});
