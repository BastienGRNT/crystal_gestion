import { beforeEach, describe, expect, it } from 'vitest';
import {
	FixedClock,
	MemoryTable,
	RecordingActivity,
	RecordingFeed,
	testId
} from '../../kernel/testing';
import type { StoredFile } from '../domain/file';
import { createFiles } from '../index';

const bytes = (text: string) =>
	new ReadableStream<Uint8Array>({
		start(controller) {
			controller.enqueue(new TextEncoder().encode(text));
			controller.close();
		}
	});

function setup() {
	const table = new MemoryTable<StoredFile>();
	const blobs = new Map<string, number>();
	const activity = new RecordingActivity();
	const files = createFiles({
		clock: new FixedClock(),
		feed: new RecordingFeed<StoredFile>(),
		activity,
		projectExists: async (id) => id === 'p1',
		files: {
			list: async () => table.all(),
			get: async (id) => table.get(id),
			insert: async (f) => table.put(f),
			save: async (f) => table.put(f),
			delete: async (id) => table.delete(id)
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
	return { files, blobs, activity };
}

describe('files', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));

	const upload = (overrides: Partial<Parameters<typeof ctx.files.upload>[0]> = {}) =>
		ctx.files.upload(
			{
				id: testId(),
				projectId: 'p1',
				name: 'devis.pdf',
				mime: 'application/pdf',
				forMessage: false,
				data: bytes('%PDF'),
				...overrides
			},
			'ana'
		);

	it('stores the measured size and logs the upload', async () => {
		const file = await upload();
		expect(file.size).toBe(4);
		expect(ctx.activity.verbs).toEqual(['file.uploaded']);
	});

	it('stays quiet for files sent with a message', async () => {
		await upload({ forMessage: true });
		expect(ctx.activity.entries).toEqual([]);
	});

	it('removes the content with the file', async () => {
		const file = await upload();
		await ctx.files.delete(file.id);
		expect(ctx.blobs.has(file.id)).toBe(false);
	});

	it('attaches a file to one message only', async () => {
		const file = await upload({ forMessage: true });
		const [attachment] = await ctx.files.attachToMessage([file.id], 'm1', 'p1');
		expect(attachment).toMatchObject({ id: file.id, name: 'devis.pdf' });
		await expect(ctx.files.attachToMessage([file.id], 'm2', 'p1')).rejects.toThrow(/déjà partagé/);
	});
});
