import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { FileStorage } from '../application/ports';

export function diskStorage(root: string): FileStorage {
	const pathOf = (key: string) => {
		const path = resolve(root, key);
		if (!path.startsWith(resolve(root))) throw new Error('Invalid storage key');
		return path;
	};
	return {
		async save(key, bytes) {
			await mkdir(dirname(pathOf(key)), { recursive: true });
			await writeFile(pathOf(key), bytes);
		},
		read: async (key) => new Uint8Array(await readFile(pathOf(key))),
		remove: (key) => rm(join(pathOf(key)), { force: true })
	};
}
