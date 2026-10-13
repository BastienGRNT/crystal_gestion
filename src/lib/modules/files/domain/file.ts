import { requiredText } from '../../kernel/domain/errors';

export interface StoredFile {
	id: string;
	projectId: string;
	/** `null`: at the root of the project's documents. */
	folderId: string | null;
	name: string;
	mime: string;
	size: number;
	uploadedBy: string;
	createdAt: string;
	/** Set when the file was shared in a message. */
	messageId: string | null;
}

export const MAX_FILE_SIZE = 200 * 1024 * 1024;

export type FileKind =
	| 'image'
	| 'video'
	| 'audio'
	| 'pdf'
	| 'text'
	| 'sheet'
	| 'slides'
	| 'doc'
	| 'archive'
	| 'design'
	| 'other';

const BY_EXTENSION: Record<string, FileKind> = {
	pdf: 'pdf',
	md: 'text',
	txt: 'text',
	json: 'text',
	csv: 'sheet',
	ts: 'text',
	js: 'text',
	svelte: 'text',
	html: 'text',
	css: 'text',
	sql: 'text',
	yml: 'text',
	yaml: 'text',
	env: 'text',
	log: 'text',
	xlsx: 'sheet',
	xls: 'sheet',
	ods: 'sheet',
	numbers: 'sheet',
	pptx: 'slides',
	key: 'slides',
	odp: 'slides',
	docx: 'doc',
	doc: 'doc',
	odt: 'doc',
	pages: 'doc',
	rtf: 'doc',
	zip: 'archive',
	rar: 'archive',
	'7z': 'archive',
	gz: 'archive',
	tar: 'archive',
	fig: 'design',
	sketch: 'design',
	psd: 'design',
	ai: 'design',
	xd: 'design'
};

const extension = (name: string) => name.split('.').at(-1)?.toLowerCase() ?? '';

export function fileKind(mime: string, name: string): FileKind {
	const [type] = mime.split('/');
	if (mime === 'application/pdf') return 'pdf';
	if (type === 'image' && !mime.includes('photoshop')) return 'image';
	if (type === 'video' || type === 'audio') return type;
	return BY_EXTENSION[extension(name)] ?? (type === 'text' ? 'text' : 'other');
}

export const canPreview = (kind: FileKind) =>
	kind === 'image' || kind === 'video' || kind === 'audio' || kind === 'pdf' || kind === 'text';

/** Keeps a readable name but never a path: uploads can't escape their folder. */
export function validFileName(name: string): string {
	const base = name.split(/[\\/]/).at(-1) ?? '';
	const printable = [...base].filter((char) => char.charCodeAt(0) >= 32).join('');
	return requiredText(printable, 'Le nom du fichier', 200);
}

/** Types a browser would run as a page: always downloaded, never opened inline. */
export const isActiveContent = (mime: string) =>
	/html|xml|javascript|ecmascript|svg/.test(mime) && !mime.startsWith('image/svg');

export function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`;
	const units = ['Ko', 'Mo', 'Go'];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit++;
	}
	return `${value.toLocaleString('fr-FR', { maximumFractionDigits: value < 10 ? 1 : 0 })} ${units[unit]}`;
}
