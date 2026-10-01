import type { Feature } from '$lib/modules/features/domain/feature';
import { folderPath, type FileLocation, type Folder } from '$lib/modules/files/domain/folder';
import type { ProjectFile } from '$lib/modules/files/domain/project-file';

export const GENERAL_FOLDER = 'general';

export const featureOptions = (features: Feature[], none = 'Aucune feature') => [
	{ value: '', label: none },
	...features.map((f) => ({ value: f.id, label: `${f.ref} · ${f.title}`, short: f.title }))
];

/** Folders are derived, never stored: "Général" plus one per feature (archived ones last). */
export function folders(features: Feature[], files: ProjectFile[]) {
	const count = (featureId: string | null) => files.filter((f) => f.featureId === featureId).length;
	const ordered = [...features].sort((a, b) => Number(!!a.archivedAt) - Number(!!b.archivedAt));
	return [
		{ id: GENERAL_FOLDER, label: 'Général', count: count(null) },
		...ordered.map((f) => ({
			...{ id: f.id, label: f.archivedAt ? `${f.title} (archivée)` : f.title },
			...{ ref: f.ref, count: count(f.id) }
		}))
	];
}

const encode = ({ featureId, folderId }: FileLocation) => `${featureId ?? ''}:${folderId ?? ''}`;

export function decodeLocation(value: string): FileLocation {
	const [featureId, folderId] = value.split(':');
	return { featureId: featureId || null, folderId: folderId || null };
}

/** Every place a file can go, sub-folders written as a path under their root. */
export function locationOptions(features: Feature[], all: Folder[]) {
	const roots = [
		{ id: null, label: 'Général' },
		...features.map((f) => ({ id: f.id, label: f.title }))
	];
	return roots.flatMap((root) => [
		{ value: encode({ featureId: root.id, folderId: null }), label: root.label },
		...all
			.filter((folder) => folder.featureId === root.id)
			.map((folder) => ({
				value: encode({ featureId: root.id, folderId: folder.id }),
				label: [root.label, ...folderPath(all, folder.id).map((f) => f.name)].join(' / ')
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	]);
}

export const locationValue = (file: ProjectFile) =>
	encode({ featureId: file.featureId, folderId: file.folderId });

export const folderFeatureId = (folderId: string) =>
	folderId === GENERAL_FOLDER ? null : folderId;

export const fileUrl = (projectId: string, fileId: string) =>
	`/api/projects/${projectId}/files/${fileId}`;
