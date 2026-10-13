import type { FileKind } from '$lib/modules/files/domain/file';

export const FILE_FILTERS: { key: string; label: string; kinds: FileKind[] | null }[] = [
	{ key: 'all', label: 'Tout', kinds: null },
	{ key: 'images', label: 'Images', kinds: ['image'] },
	{ key: 'docs', label: 'Documents', kinds: ['pdf', 'doc', 'sheet', 'slides', 'text'] },
	{ key: 'media', label: 'Vidéos et sons', kinds: ['video', 'audio'] },
	{ key: 'design', label: 'Design', kinds: ['design'] },
	{ key: 'other', label: 'Autres', kinds: ['archive', 'other'] }
];
