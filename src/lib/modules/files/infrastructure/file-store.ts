import type { Executor } from '$lib/server/db/types';
import { drizzleElementStore } from '../../elements/infrastructure/element-store';
import type { FileFields } from '../application/ports';
import type { ProjectFile } from '../domain/project-file';
import { files } from './schema';

export const drizzleFileStore = (db: Executor) =>
	drizzleElementStore<typeof files, ProjectFile, FileFields>(db, {
		table: files,
		kind: () => 'file',
		titleOf: (fields) => fields.title,
		toRow: ({ title: _title, ...fields }) => fields,
		toElement: (row, meta) => ({
			...row,
			kind: 'file',
			ref: meta.ref,
			title: meta.title,
			createdBy: meta.createdBy,
			createdAt: meta.createdAt
		})
	});
