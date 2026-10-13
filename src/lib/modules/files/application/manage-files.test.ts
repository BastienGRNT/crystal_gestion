import { beforeEach, describe, expect, it } from 'vitest';
import {
	FakeAccess,
	FixedClock,
	MemoryTable,
	RecordingActivity,
	RecordingFeed,
	testId
} from '../../kernel/testing';
import type { StoredFile } from '../domain/file';
import type { Folder } from '../domain/folder';
import { createFiles } from '../index';

const bytes = (text: string) =>
	new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(text));
			controller.close();
		}
	});

function setup() {
	const files = new MemoryTable<StoredFile>();
	const folders = new MemoryTable<Folder>();
	const blobs = new Map<string, number>();
	const activity = new RecordingActivity();
	const module = createFiles({
		clock: new FixedClock(),
		feed: new RecordingFeed<StoredFile>(),
		folderFeed: new RecordingFeed<Folder>(),
		activity,
		access: new FakeAccess({ p1: ['ana'], p2: ['ana'] }),
		files: {
			ofProjects: async () => files.all(),
			inFolders: async (ids: string[]) =>
				files.all().filter((f) => f.folderId && ids.includes(f.folderId)),
			get: async (id: string) => files.get(id),
			insert: async (f) => files.put(f),
			save: async (f) => files.put(f),
			delete: async (id: string) => files.delete(id)
		},
		folders: {
			ofProjects: async () => folders.all(),
			get: async (id: string) => folders.get(id),
			chatFolder: async (projectId: string) =>
				folders.all().find((f) => f.projectId === projectId && f.system === 'chat') ?? null,
			insert: async (f) => folders.put(f),
			save: async (f) => folders.put(f),
			delete: async (id: string) => {
				for (const f of folders.all()) if (f.id === id || f.parentId === id) folders.delete(f.id);
			}
		},
		blobs: {
			async write(key, data) {
				let size = 0;
				for await (const chunk of data) size += chunk.byteLength;
				blobs.set(key, size);
				return size;
			},
			read: () => bytes(''),
			remove: async (key) => void blobs.delete(key)
		}
	});
	return { files: module, blobs, activity };
}

describe('documents', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));
	const upload = (extra: Partial<Parameters<typeof ctx.files.upload>[0]> = {}) =>
		ctx.files.upload(
			{
				id: testId(),
				projectId: 'p1',
				folderId: null,
				name: 'devis.pdf',
				mime: 'application/pdf',
				forMessage: false,
				data: bytes('%PDF'),
				...extra
			},
			'ana'
		);

	it('files what is shared in messages in the discussion folder, quietly', async () => {
		const file = await upload({ forMessage: true });
		expect(file.folderId).not.toBeNull();
		expect(ctx.activity.entries).toEqual([]);
	});

	it('refuses a folder from another project', async () => {
		const folder = await ctx.files.createFolder(
			{ id: testId(), projectId: 'p2', parentId: null, name: 'Compta' },
			'ana'
		);
		await expect(upload({ folderId: folder.id })).rejects.toThrow(/autre projet/);
	});

	it('deletes a folder with its files and their content', async () => {
		const design = await ctx.files.createFolder(
			{ id: testId(), projectId: 'p1', parentId: null, name: 'Design' },
			'ana'
		);
		const inner = await ctx.files.createFolder(
			{ id: testId(), projectId: 'p1', parentId: design.id, name: 'V2' },
			'ana'
		);
		const file = await upload({ folderId: inner.id });
		await ctx.files.deleteFolder(design.id, 'ana');
		expect(ctx.blobs.has(file.id)).toBe(false);
	});

	it('never moves a folder into its own subfolder', async () => {
		const a = await ctx.files.createFolder(
			{ id: testId(), projectId: 'p1', parentId: null, name: 'A' },
			'ana'
		);
		const b = await ctx.files.createFolder(
			{ id: testId(), projectId: 'p1', parentId: a.id, name: 'B' },
			'ana'
		);
		await expect(ctx.files.updateFolder(a.id, { parentId: b.id }, 'ana')).rejects.toThrow(
			/sous-dossiers/
		);
	});
});
