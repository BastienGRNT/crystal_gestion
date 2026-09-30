import type { ElementBase } from '$lib/modules/kernel/domain/element';

export const MAX_FILE_BYTES = 50 * 1024 * 1024;

export interface ProjectFile extends ElementBase {
	kind: 'file';
	projectId: string;
	/** `null` is the general folder; otherwise the feature's folder. */
	featureId: string | null;
	mimeType: string;
	size: number;
	storageKey: string;
	createdBy: string | null;
	createdAt: string;
}

export type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'text';

export function previewKind(mimeType: string): PreviewKind | null {
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType === 'application/pdf') return 'pdf';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	if (mimeType.startsWith('text/') || mimeType === 'application/json') return 'text';
	return null;
}

export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
	return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
