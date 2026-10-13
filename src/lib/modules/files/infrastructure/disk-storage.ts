import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeWebStream } from 'node:stream/web';
import { invalid } from '../../kernel/domain/errors';
import type { BlobStorage } from '../application/ports';

/** Files live on the local disk, named by their id (never by what the uploader called them). */
export function diskStorage(directory: string): BlobStorage {
	const root = resolve(directory);
	const pathOf = (key: string) => {
		if (!/^[0-9a-f-]{36}$/.test(key)) throw invalid('Identifiant de fichier invalide.');
		return join(root, key.slice(0, 2), key);
	};

	return {
		async write(key, data, maxBytes) {
			const path = pathOf(key);
			await mkdir(join(root, key.slice(0, 2)), { recursive: true });
			let size = 0;
			const limit = new Transform({
				transform(chunk: Buffer, _encoding, done) {
					size += chunk.length;
					if (size > maxBytes) done(invalid('Ce fichier est trop lourd (200 Mo maximum).'));
					else done(null, chunk);
				}
			});
			try {
				await pipeline(
					Readable.fromWeb(data as NodeWebStream<Uint8Array>),
					limit,
					createWriteStream(path)
				);
			} catch (error) {
				await rm(path, { force: true });
				throw error;
			}
			return size;
		},
		read(key, range) {
			const stream = createReadStream(pathOf(key), range);
			return Readable.toWeb(stream) as ReadableStream<Uint8Array>;
		},
		async remove(key) {
			await rm(pathOf(key), { force: true });
		}
	};
}
