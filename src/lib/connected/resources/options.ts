import type { Feature } from '$lib/modules/features/domain/feature';
import type { ProjectFile } from '$lib/modules/files/domain/project-file';

export const GENERAL_FOLDER = 'general';

export const featureOptions = (features: Feature[], none = 'Aucune feature') => [
	{ value: '', label: none },
	...features.map((f) => ({ value: f.id, label: `${f.ref} · ${f.title}`, short: f.title }))
];

/** Folders are derived, never stored: "Général" plus one per feature, always in sync. */
export function folders(features: Feature[], files: ProjectFile[]) {
	const count = (featureId: string | null) => files.filter((f) => f.featureId === featureId).length;
	return [
		{ id: GENERAL_FOLDER, label: 'Général', count: count(null) },
		...features.map((f) => ({ id: f.id, label: f.title, ref: f.ref, count: count(f.id) }))
	];
}

export const folderFeatureId = (folderId: string) =>
	folderId === GENERAL_FOLDER ? null : folderId;

export const fileUrl = (projectId: string, fileId: string) =>
	`/api/projects/${projectId}/files/${fileId}`;
